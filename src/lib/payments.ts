export type LessonPaymentStatus = "paid" | "part-paid" | "unpaid";

export type PaymentLike = {
  id: string;
  amount_pence: number;
  source?: string | null;
  note?: string | null;
};

export type AllocationLike = {
  payment_id: string;
  lesson_id: string;
  amount_pence: number;
  payment?: PaymentLike | null;
};

export type LessonFeeLike = {
  id: string;
  fee_pence: number;
  lesson_at: string;
};

const IMPORTED_PAYMENT_NOTE = "Imported from paid lesson";

function isImportedBackfillPayment(payment: PaymentLike) {
  return payment.source === "imported" || payment.note === IMPORTED_PAYMENT_NOTE;
}

export function getPaidAllocatedAmountForLesson(lessonId: string, allocations: AllocationLike[]) {
  return allocations
    .filter((allocation) => allocation.lesson_id === lessonId)
    .reduce((sum, allocation) => sum + allocation.amount_pence, 0);
}

export function calculateLessonPaymentStatus(
  lesson: { id: string; fee_pence: number },
  allocations: AllocationLike[],
): LessonPaymentStatus {
  if (lesson.fee_pence <= 0) {
    return "paid";
  }

  // A lesson is paid only from explicit paid allocations linked to this lesson.
  // Stale lesson.paid values or unrelated payment credit must not affect badges.
  const paidAmount = getPaidAllocatedAmountForLesson(lesson.id, allocations);

  if (paidAmount >= lesson.fee_pence) {
    return "paid";
  }

  if (paidAmount > 0) {
    return "part-paid";
  }

  return "unpaid";
}

export function getOutstandingLessonAmount(lesson: { id: string; fee_pence: number }, allocations: AllocationLike[]) {
  return Math.max(0, lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, allocations));
}

export function calculateStudentCredit(payments: PaymentLike[], allocations: AllocationLike[]) {
  const allocatedByPaymentId = new Map<string, number>();

  for (const allocation of allocations) {
    allocatedByPaymentId.set(
      allocation.payment_id,
      (allocatedByPaymentId.get(allocation.payment_id) ?? 0) + allocation.amount_pence,
    );
  }

  return payments
    .reduce((sum, payment) => {
      if (isImportedBackfillPayment(payment)) {
        return sum;
      }

      return sum + Math.max(0, payment.amount_pence - (allocatedByPaymentId.get(payment.id) ?? 0));
    }, 0);
}

export function getPaymentStatusLabel(status: LessonPaymentStatus) {
  if (status === "part-paid") {
    return "Part-paid";
  }

  return status === "paid" ? "Paid" : "Unpaid";
}

export function getPaymentStatusClassName(status: LessonPaymentStatus) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "part-paid") {
    return "bg-sky-100 text-sky-800";
  }

  return "bg-amber-100 text-amber-800";
}

export function autoApplyPaymentToLessons(
  payment: PaymentLike,
  lessons: LessonFeeLike[],
  allocations: AllocationLike[],
) {
  if (payment.amount_pence <= 0) {
    return [];
  }

  // Imported payments are one-off backfills for their original lessons.
  // If old test data has accidental future allocations, remove those rows manually;
  // new auto-apply must not treat imported records as future credit.
  if (isImportedBackfillPayment(payment)) {
    return [];
  }

  const alreadyAllocated = allocations
    .filter((allocation) => allocation.payment_id === payment.id)
    .reduce((sum, allocation) => sum + allocation.amount_pence, 0);
  let remaining = Math.max(0, payment.amount_pence - alreadyAllocated);
  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(a.lesson_at).getTime() - new Date(b.lesson_at).getTime(),
  );
  const newAllocations: Array<{ payment_id: string; lesson_id: string; amount_pence: number }> = [];

  for (const lesson of sortedLessons) {
    if (remaining <= 0) {
      break;
    }

    const outstanding = getOutstandingLessonAmount(lesson, allocations);

    if (outstanding <= 0) {
      continue;
    }

    const amount = Math.min(remaining, outstanding);
    newAllocations.push({
      payment_id: payment.id,
      lesson_id: lesson.id,
      amount_pence: amount,
    });
    remaining -= amount;
  }

  return newAllocations;
}

export function getPreferredLessonFee(
  student: { default_fee_pence?: number | null },
  latestLesson: { fee_pence?: number | null } | null,
  fallbackPence = 0,
) {
  return student.default_fee_pence ?? latestLesson?.fee_pence ?? fallbackPence;
}
