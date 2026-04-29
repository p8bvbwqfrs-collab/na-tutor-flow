import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  calculateLessonPaymentStatus,
  calculateStudentCredit,
  getOutstandingLessonAmount,
  type AllocationLike,
  type PaymentLike,
} from "@/lib/payments";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { LessonPageHeader } from "../../components/lesson-page-header";
import { NewLessonForm } from "../../new-lesson/new-lesson-form";
import { ScheduleLessonForm } from "../../schedule-lesson/schedule-lesson-form";

type EditLessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
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

export default async function EditLessonPage({ params, searchParams }: EditLessonPageProps) {
  const { id, lessonId } = await params;
  const { mode } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error: studentError }, { data: lesson, error: lessonError }, currencyCode] = await Promise.all([
    supabase.from("students").select("id, student_name").eq("id", id).maybeSingle(),
    supabase
      .from("lessons")
      .select("id, student_id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, effort, confidence, fee_pence, paid, status, next_lesson_id")
      .eq("id", lessonId)
      .eq("student_id", id)
      .maybeSingle(),
    getUserCurrencyCode(supabase),
  ]);

  if (studentError || lessonError || !student || !lesson) {
    notFound();
  }

  const linkedNextLessonResult = lesson.next_lesson_id
    ? await supabase
        .from("lessons")
        .select("id, lesson_at, topics, status")
        .eq("id", lesson.next_lesson_id)
        .eq("student_id", id)
        .eq("status", "planned")
        .maybeSingle()
    : { data: null, error: null };

  const lessonStatus = lesson.status ?? "completed";
  const isPlannedLesson = lessonStatus === "planned";
  const isCompletingPlannedLesson = isPlannedLesson && mode === "complete";
  const plannedTopics = lesson.topics === "Planned lesson" ? "" : lesson.topics;
  const allocationsResult = await supabase
    .from("payment_allocations")
    .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
    .eq("lesson_id", lesson.id);
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);
  const outstandingPence = getOutstandingLessonAmount(lesson, allocations);
  const [{ data: paymentRows }, { data: studentLessonRows }] = await Promise.all([
    supabase.from("payments").select("id, amount_pence, source, note").eq("student_id", id),
    supabase.from("lessons").select("id").eq("student_id", id),
  ]);
  const studentLessonIds = (studentLessonRows ?? []).map((studentLesson) => studentLesson.id);
  const studentAllocationsResult =
    studentLessonIds.length > 0
      ? await supabase
          .from("payment_allocations")
          .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
          .in("lesson_id", studentLessonIds)
      : { data: [] };
  const studentAllocations = ((studentAllocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const availableCreditPence = calculateStudentCredit((paymentRows ?? []) as PaymentLike[], studentAllocations);

  return (
    <section className="w-full min-w-0 max-w-3xl">
      <LessonPageHeader
        studentName={student.student_name}
        pageLabel={
          isCompletingPlannedLesson
            ? "Complete lesson"
            : isPlannedLesson
              ? "Edit scheduled lesson"
              : "Edit lesson"
        }
        metaLabel={isPlannedLesson && !isCompletingPlannedLesson ? "Planned lesson" : undefined}
        backHref={`/app/students/${student.id}`}
      />

      {isPlannedLesson && !isCompletingPlannedLesson ? (
        <ScheduleLessonForm
          mode="edit"
          lessonId={lesson.id}
          studentId={student.id}
          studentName={student.student_name}
          currencyCode={currencyCode}
          initialLesson={{
            lessonAt: lesson.lesson_at,
            topics: plannedTopics,
            feeAmount: (lesson.fee_pence / 100).toFixed(2),
          }}
        />
      ) : (
        <NewLessonForm
          mode="edit"
          lessonId={lesson.id}
          studentId={student.id}
          studentName={student.student_name}
          currencyCode={currencyCode}
          saveStatus="completed"
          completionMode={isCompletingPlannedLesson}
          initialLesson={{
            lessonAt: lesson.lesson_at,
            topics: plannedTopics,
            topicTags: lesson.topic_tags ?? [],
            wentWell: lesson.went_well ?? "",
            parentNote: lesson.parent_note ?? "",
            improve: lesson.improve ?? "",
            homework: lesson.homework ?? "",
            effort: lesson.effort,
            confidence: lesson.confidence,
            feeAmount: (lesson.fee_pence / 100).toFixed(2),
            paid: paymentStatus === "paid",
            paymentStatus,
            availableCreditPence,
            outstandingPence,
            nextLesson: linkedNextLessonResult.data
              ? {
                  id: linkedNextLessonResult.data.id,
                  lessonAt: linkedNextLessonResult.data.lesson_at,
                  topics: linkedNextLessonResult.data.topics,
                }
              : null,
          }}
        />
      )}
    </section>
  );
}
