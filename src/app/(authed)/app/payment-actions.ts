"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOutstandingLessonAmount, type AllocationLike, type PaymentLike } from "@/lib/payments";
import { getDateKeyLocal } from "@/lib/datetime";
import { getUserTimeZone } from "@/lib/user-settings";

type AllocationRow = {
  id?: string;
  payment_id: string;
  lesson_id: string;
  amount_pence: number;
  payment: PaymentLike | PaymentLike[] | null;
};

type PaymentRow = PaymentLike & {
  payment_date?: string | null;
  created_at?: string | null;
};

function getPayment(payment: PaymentLike | PaymentLike[] | null | undefined) {
  return Array.isArray(payment) ? payment[0] ?? null : payment ?? null;
}

function isLessonSpecificPayment(payment: PaymentLike | null | undefined) {
  return (
    payment?.source === "lesson_paid_now" ||
    payment?.source === "imported" ||
    payment?.note === "Payment recorded for lesson" ||
    payment?.note === "Marked paid from lesson" ||
    payment?.note === "Marked paid from dashboard" ||
    payment?.note === "Imported from paid lesson"
  );
}

function getMarkUnpaidMode(allocations: AllocationRow[]) {
  const hasLessonSpecific = allocations.some((allocation) => isLessonSpecificPayment(getPayment(allocation.payment)));
  const hasReusableCredit = allocations.some((allocation) => {
    const payment = getPayment(allocation.payment);
    return payment && !isLessonSpecificPayment(payment);
  });

  if (hasLessonSpecific && !hasReusableCredit) {
    return "lesson_specific" as const;
  }

  if (hasReusableCredit && !hasLessonSpecific) {
    return "credit" as const;
  }

  return "mixed" as const;
}

async function verifyActiveOwnedLesson(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  lessonId: string,
  userId: string,
) {
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, user_id, student_id, fee_pence")
    .eq("id", lessonId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lessonError || !lesson) {
    return { lesson: null, error: "Could not find this lesson." };
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, archived_at")
    .eq("id", lesson.student_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (studentError || !student) {
    return { lesson: null, error: "Could not find this student." };
  }

  if (student.archived_at) {
    return {
      lesson: null,
      error: "This student is archived. Restore the student before changing payments.",
    };
  }

  return { lesson, error: null };
}

async function insertReceivedPaymentForLesson({
  amountPence,
  lessonId,
  studentId,
  userId,
}: {
  amountPence: number;
  lessonId: string;
  studentId: string;
  userId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const timeZone = await getUserTimeZone(supabase);
  const paymentPayload = {
    user_id: userId,
    student_id: studentId,
    amount_pence: amountPence,
    status: "paid",
    payment_date: getDateKeyLocal(new Date(), timeZone),
    source: "lesson_paid_now",
    note: "Payment recorded for lesson",
  };

  const paymentResult = await supabase.from("payments").insert(paymentPayload).select("id").single();

  if (paymentResult.error || !paymentResult.data) {
    console.error("Could not record payment for lesson", {
      lessonId,
      studentId,
      amountPence,
      error: paymentResult.error,
    });
    return { ok: false, error: "Could not record the payment." };
  }

  const { error: allocationError } = await supabase.from("payment_allocations").insert({
    user_id: userId,
    payment_id: paymentResult.data.id,
    lesson_id: lessonId,
    amount_pence: amountPence,
  });

  if (allocationError) {
    console.error("Could not allocate recorded payment to lesson", {
      lessonId,
      paymentId: paymentResult.data.id,
      amountPence,
      error: allocationError,
    });
    return { ok: false, error: "Could not record the payment." };
  }

  return { ok: true };
}

export async function payOutstandingLessonAmount(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You need to be signed in to record payment." };
  }

  const verification = await verifyActiveOwnedLesson(supabase, lessonId, user.id);
  const lesson = verification.lesson;

  if (!lesson) {
    return { ok: false, error: verification.error ?? "Could not record the payment." };
  }

  if (lesson.fee_pence <= 0) {
    return { ok: true };
  }

  const { data: allocationRows, error: allocationReadError } = await supabase
    .from("payment_allocations")
    .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
    .eq("lesson_id", lessonId);

  if (allocationReadError) {
    console.error("Could not read existing allocations before payment", { lessonId, error: allocationReadError });
    return { ok: false, error: "Could not record the payment." };
  }

  const allocations = ((allocationRows ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const outstandingPence = getOutstandingLessonAmount(lesson, allocations);

  if (outstandingPence <= 0) {
    return { ok: true };
  }

  const creditResult = await applyAvailableCreditToLesson(lessonId);

  if (!creditResult.ok) {
    return {
      ok: false,
      error: creditResult.error ?? "Could not apply the student's available credit.",
    };
  }

  const remainingPence = creditResult.remainingPence ?? outstandingPence;

  if (remainingPence <= 0) {
    return { ok: true };
  }

  return insertReceivedPaymentForLesson({
    amountPence: remainingPence,
    lessonId,
    studentId: lesson.student_id,
    userId: user.id,
  });
}

export async function markLessonPaid(lessonId: string) {
  return payOutstandingLessonAmount(lessonId);
}

export async function getMarkLessonUnpaidConfirmation(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: allocations, error } = await supabase
    .from("payment_allocations")
    .select("id, payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
    .eq("lesson_id", lessonId);

  if (error) {
    return {
      ok: false,
      message: "This will mark the lesson as unpaid. Any reusable payment credit will remain on the student account.",
    };
  }

  const mode = getMarkUnpaidMode((allocations ?? []) as AllocationRow[]);

  if (mode === "lesson_specific") {
    return {
      ok: true,
      message: "This will mark the lesson as unpaid and remove the payment recorded for this lesson.",
    };
  }

  if (mode === "credit") {
    return {
      ok: true,
      message: "This will remove the payment from this lesson. The money will remain as credit for this student.",
    };
  }

  return {
    ok: true,
    message: "This will mark the lesson as unpaid. Any reusable payment credit will remain on the student account.",
  };
}

export async function markLessonUnpaid(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to change payments." };
  }

  const verification = await verifyActiveOwnedLesson(supabase, lessonId, user.id);

  if (!verification.lesson) {
    return { ok: false, error: verification.error ?? "Could not change this payment." };
  }

  const { data: allocations, error: readError } = await supabase
    .from("payment_allocations")
    .select("id, payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
    .eq("lesson_id", lessonId);

  if (readError) {
    console.error("Could not read allocations before marking unpaid", { lessonId, error: readError });
    return { ok: false, error: "Could not remove payment from this lesson." };
  }

  const lessonAllocations = (allocations ?? []) as AllocationRow[];
  const lessonSpecificPaymentIds = lessonAllocations
    .filter((allocation) => isLessonSpecificPayment(getPayment(allocation.payment)))
    .map((allocation) => allocation.payment_id);
  const { error } = await supabase.from("payment_allocations").delete().eq("lesson_id", lessonId);

  if (error) {
    console.error("Could not delete allocations while marking lesson unpaid", { lessonId, error });
    return { ok: false, error: "Could not remove payment from this lesson." };
  }

  for (const paymentId of lessonSpecificPaymentIds) {
    const { count, error: countError } = await supabase
      .from("payment_allocations")
      .select("id", { count: "exact", head: true })
      .eq("payment_id", paymentId);

    if (countError) {
      console.error("Could not check remaining allocations for lesson-specific payment", {
        lessonId,
        paymentId,
        error: countError,
      });
      continue;
    }

    if ((count ?? 0) === 0) {
      const { error: deletePaymentError } = await supabase.from("payments").delete().eq("id", paymentId);

      if (deletePaymentError) {
        console.error("Could not delete unused lesson-specific payment", {
          lessonId,
          paymentId,
          error: deletePaymentError,
        });
      }
    }
  }

  return { ok: true };
}

export async function applyAvailableCreditToLesson(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You need to be signed in to use credit." };
  }

  const verification = await verifyActiveOwnedLesson(supabase, lessonId, user.id);
  const lesson = verification.lesson;

  if (!lesson) {
    return { ok: false, error: verification.error ?? "Could not use available credit." };
  }

  const { data: lessonRows, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("student_id", lesson.student_id);

  if (lessonsError) {
    return { ok: false, error: "Could not check this student's lessons." };
  }

  const lessonIds = (lessonRows ?? []).map((row) => row.id);
  const [{ data: paymentRows, error: paymentsError }, allocationsResult] = await Promise.all([
    supabase
      .from("payments")
      .select("id, amount_pence, payment_date, source, note, created_at")
      .eq("student_id", lesson.student_id)
      .order("payment_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    lessonIds.length > 0
      ? supabase
          .from("payment_allocations")
          .select("id, payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (paymentsError || allocationsResult.error) {
    return { ok: false, error: "Could not check available credit." };
  }

  const payments = (paymentRows ?? []) as PaymentRow[];
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  }));
  let remainingPence = getOutstandingLessonAmount(lesson, allocations as AllocationLike[]);
  let appliedPence = 0;

  if (remainingPence <= 0) {
    return { ok: true, appliedPence, remainingPence: 0 };
  }

  const allocatedByPaymentId = new Map<string, number>();
  const lessonAllocationByPaymentId = new Map<string, AllocationRow>();

  for (const allocation of allocations) {
    allocatedByPaymentId.set(
      allocation.payment_id,
      (allocatedByPaymentId.get(allocation.payment_id) ?? 0) + allocation.amount_pence,
    );

    if (allocation.lesson_id === lessonId) {
      lessonAllocationByPaymentId.set(allocation.payment_id, allocation as AllocationRow);
    }
  }

  for (const payment of payments) {
    if (remainingPence <= 0) {
      break;
    }

    if (payment.source === "imported" || payment.note === "Imported from paid lesson") {
      continue;
    }

    const availablePence = Math.max(0, payment.amount_pence - (allocatedByPaymentId.get(payment.id) ?? 0));

    if (availablePence <= 0) {
      continue;
    }

    const amountPence = Math.min(availablePence, remainingPence);
    const existingLessonAllocation = lessonAllocationByPaymentId.get(payment.id);
    const allocationResult = existingLessonAllocation?.id
      ? await supabase
          .from("payment_allocations")
          .update({ amount_pence: existingLessonAllocation.amount_pence + amountPence })
          .eq("id", existingLessonAllocation.id)
      : await supabase.from("payment_allocations").insert({
          user_id: user.id,
          payment_id: payment.id,
          lesson_id: lessonId,
          amount_pence: amountPence,
        });

    if (allocationResult.error) {
      return { ok: false, error: "Could not use available credit." };
    }

    appliedPence += amountPence;
    remainingPence -= amountPence;
    allocatedByPaymentId.set(payment.id, (allocatedByPaymentId.get(payment.id) ?? 0) + amountPence);

    if (existingLessonAllocation) {
      existingLessonAllocation.amount_pence += amountPence;
    }
  }

  return { ok: true, appliedPence, remainingPence };
}
