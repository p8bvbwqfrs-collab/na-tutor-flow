import { notFound, redirect } from "next/navigation";
import { getLatestStudentFeeAmount } from "@/lib/lesson-fees";
import { calculateStudentCredit, type AllocationLike, type PaymentLike } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { LessonPageHeader } from "../components/lesson-page-header";
import { NewLessonForm } from "./new-lesson-form";

type NewLessonPageProps = {
  params: Promise<{ id: string }>;
};

type AllocationRow = {
  payment_id: string;
  lesson_id: string;
  amount_pence: number;
  payment: PaymentLike | PaymentLike[] | null;
};

function getPayment(payment: PaymentLike | PaymentLike[] | null | undefined) {
  return Array.isArray(payment) ? payment[0] ?? null : payment ?? null;
}

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error }, initialFeeAmount, currencyCode] = await Promise.all([
    supabase
      .from("students")
      .select("id, student_name, archived_at")
      .eq("id", id)
      .maybeSingle(),
    getLatestStudentFeeAmount(supabase, id),
    getUserCurrencyCode(supabase),
  ]);

  if (error || !student) {
    notFound();
  }

  if (student.archived_at) {
    redirect(`/app/students/${student.id}?archived=1`);
  }

  const [{ data: paymentRows }, { data: lessonRows }] = await Promise.all([
    supabase.from("payments").select("id, amount_pence, source, note").eq("student_id", id),
    supabase.from("lessons").select("id").eq("student_id", id),
  ]);
  const lessonIds = (lessonRows ?? []).map((lesson) => lesson.id);
  const allocationsResult =
    lessonIds.length > 0
      ? await supabase
          .from("payment_allocations")
          .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
          .in("lesson_id", lessonIds)
      : { data: [] };
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const availableCreditPence = calculateStudentCredit((paymentRows ?? []) as PaymentLike[], allocations);

  return (
    <section className="w-full min-w-0 max-w-3xl">
      <LessonPageHeader
        studentName={student.student_name}
        pageLabel="Log lesson"
        backHref={`/app/students/${student.id}`}
      />

      <NewLessonForm
        studentId={student.id}
        studentName={student.student_name}
        currencyCode={currencyCode}
        initialLesson={{
          lessonAt: new Date().toISOString(),
          topics: "",
          topicTags: [],
          wentWell: "",
          parentNote: "",
          improve: "",
          homework: "",
          effort: 3,
          confidence: 3,
          feeAmount: initialFeeAmount,
          availableCreditPence,
        }}
      />
    </section>
  );
}
