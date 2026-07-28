import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatCurrencyFromMinorUnits } from "@/lib/currency";
import { formatDateLocal, formatDateTimeLocal, formatTimeLocal } from "@/lib/datetime";
import { formatParentUpdate } from "@/lib/parent-update";
import {
  calculateLessonPaymentStatus,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
  type PaymentLike,
} from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { LessonUpdateActions } from "@/components/lesson-update-actions";
import { DeleteLessonButton } from "../../../components/delete-lesson-button";
import { LessonPageHeader } from "../../../components/lesson-page-header";

type ViewLessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

type LessonStatus = "planned" | "completed" | "cancelled" | null;

type OtherLesson = {
  id: string;
  lesson_at: string;
  topics: string | null;
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

function cleanLessonText(value: string) {
  return value
    .split(/\n|;/)
    .map((part) => part.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function isCompletedLessonStatus(status: LessonStatus) {
  return status === "completed" || status === null;
}

function NoteBlock({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-800">{children}</p>
    </div>
  );
}

export default async function ViewLessonPage({ params }: ViewLessonPageProps) {
  const { id, lessonId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error: studentError }, { data: lesson, error: lessonError }, currencyCode] =
    await Promise.all([
      supabase.from("students").select("id, student_name, archived_at").eq("id", id).maybeSingle(),
      supabase
        .from("lessons")
        .select(
          "id, student_id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, effort, confidence, fee_pence, paid, status, next_lesson_id",
        )
        .eq("id", lessonId)
        .eq("student_id", id)
        .maybeSingle(),
      getUserCurrencyCode(supabase),
    ]);

  if (studentError || lessonError || !student || !lesson) {
    notFound();
  }

  if (!isCompletedLessonStatus(lesson.status as LessonStatus)) {
    redirect(`/app/students/${student.id}/lessons/${lesson.id}`);
  }

  const linkedNextLessonResult = lesson.next_lesson_id
    ? await supabase
        .from("lessons")
        .select("id, lesson_at, topics, status")
        .eq("id", lesson.next_lesson_id)
        .eq("student_id", id)
        .maybeSingle()
    : { data: null, error: null };
  const allocationsResult = await supabase
    .from("payment_allocations")
    .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
    .eq("lesson_id", lesson.id);
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);
  const otherLessonsResult = await supabase
    .from("lessons")
    .select("id, lesson_at, topics")
    .eq("student_id", id)
    .neq("id", lesson.id)
    .or("status.eq.completed,status.is.null")
    .order("lesson_at", { ascending: false })
    .limit(3);
  const otherLessons = (otherLessonsResult.data ?? []) as OtherLesson[];

  const parentUpdate = formatParentUpdate(student.student_name, {
    lessonAt: lesson.lesson_at,
    topics: lesson.topics ?? "",
    wentWell: lesson.went_well ?? "",
    parentNote: lesson.parent_note ?? "",
    improve: lesson.improve ?? "",
    homework: lesson.homework ?? "",
    effort: lesson.effort,
    confidence: lesson.confidence,
    nextLessonAt: linkedNextLessonResult.data?.lesson_at,
  });
  const details = [
    {
      label: "Effort",
      value: `${lesson.effort}/5`,
    },
    {
      label: "Confidence",
      value: `${lesson.confidence}/5`,
    },
    {
      label: "Fee",
      value: formatCurrencyFromMinorUnits(lesson.fee_pence, currencyCode),
    },
    {
      label: "Payment",
      value: getPaymentStatusLabel(paymentStatus),
    },
  ];

  return (
    <section className="w-full min-w-0 max-w-3xl">
      <LessonPageHeader
        studentName={student.student_name}
        pageLabel="Lesson notes"
        backHref={`/app/students/${student.id}`}
      />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Date/time</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
              <span>{formatDateLocal(lesson.lesson_at)} at {formatTimeLocal(lesson.lesson_at)}</span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
              >
                {getPaymentStatusLabel(paymentStatus)}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end">
            {!student.archived_at ? (
              <Link
                href={`/app/students/${student.id}/lessons/${lesson.id}`}
                className="inline-flex min-h-9 items-center justify-center rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Edit lesson
              </Link>
            ) : null}
            <LessonUpdateActions message={parentUpdate} />
            {!student.archived_at ? (
              <DeleteLessonButton
                lessonId={lesson.id}
                studentId={student.id}
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {lesson.topics ? <NoteBlock title="What was covered">{cleanLessonText(lesson.topics)}</NoteBlock> : null}

          {lesson.topic_tags && lesson.topic_tags.length > 0 ? (
            <div>
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Topic tags</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lesson.topic_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {lesson.went_well ? <NoteBlock title="What went well">{cleanLessonText(lesson.went_well)}</NoteBlock> : null}

          {lesson.improve ? <NoteBlock title="Area to improve">{cleanLessonText(lesson.improve)}</NoteBlock> : null}

          {lesson.homework ? <NoteBlock title="Homework">{cleanLessonText(lesson.homework)}</NoteBlock> : null}

          {lesson.parent_note ? <NoteBlock title="Quick note for contact">{lesson.parent_note}</NoteBlock> : null}

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lesson details</h2>
            <dl className="mt-2 grid gap-2 sm:grid-cols-4">
              {details.map((item) => (
                <div key={item.label} className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <dt className="text-xs text-zinc-500">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {linkedNextLessonResult.data ? (
            <div>
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Linked next lesson</h2>
              <Link
                href={
                  linkedNextLessonResult.data.status === "planned" && !student.archived_at
                    ? `/app/students/${student.id}/lessons/${linkedNextLessonResult.data.id}`
                    : linkedNextLessonResult.data.status === "planned"
                      ? `/app/students/${student.id}`
                      : `/app/students/${student.id}/lessons/${linkedNextLessonResult.data.id}/view`
                }
                className="mt-2 block rounded-md border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <span className="block text-sm font-medium text-zinc-900">
                  {formatDateTimeLocal(linkedNextLessonResult.data.lesson_at)}
                </span>
                {linkedNextLessonResult.data.topics ? (
                  <span className="mt-1 block text-sm text-zinc-600">
                    {cleanLessonText(linkedNextLessonResult.data.topics)}
                  </span>
                ) : null}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-medium text-zinc-900">Recent lessons</h2>
          <Link
            href={`/app/students/${student.id}`}
            className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            View all lessons
          </Link>
        </div>

        {otherLessons.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {otherLessons.map((otherLesson) => (
              <div
                key={otherLesson.id}
                className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <p className="text-sm font-medium text-zinc-900">{formatDateLocal(otherLesson.lesson_at)}</p>
                <p className="min-w-0 line-clamp-2 text-sm text-zinc-600">
                  {otherLesson.topics ? cleanLessonText(otherLesson.topics) : "No focus captured yet."}
                </p>
                <Link
                  href={`/app/students/${student.id}/lessons/${otherLesson.id}/view`}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  View notes
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            No other completed lessons yet.
          </p>
        )}
      </section>
    </section>
  );
}
