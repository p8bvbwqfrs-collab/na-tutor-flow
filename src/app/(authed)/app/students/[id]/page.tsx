import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { formatCurrencyFromMinorUnits } from "@/lib/currency";
import {
  formatDateLocal,
  formatDateTimeLocal,
  formatShortDateLocal,
  formatTimeLocal,
  getMonthKeyLocal,
} from "@/lib/datetime";
import {
  getPaymentReportingDate,
  getReportingRange,
  getReportingRangeLabel,
  isInReportingRange,
} from "@/lib/financial-reporting";
import { getUserCurrencyCode, getUserTimeZone } from "@/lib/user-settings";
import { formatParentUpdate } from "@/lib/parent-update";
import { partitionPlannedLessons } from "@/lib/lesson-attention";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LessonUpdateActions } from "@/components/lesson-update-actions";
import {
  calculateLessonPaymentStatus,
  calculateStudentCredit,
  getOutstandingLessonAmount,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
  type PaymentLike,
} from "@/lib/payments";
import { CompletedLessonUpdateBanner } from "./components/completed-lesson-update-banner";
import { LessonSuccessPanel } from "./components/lesson-success-panel";
import { MonthlySummaryGenerator } from "./components/monthly-summary-generator";
import { PastLessonsMonthlySection } from "./components/past-lessons-monthly-section";
import { PaymentsMonthlySection } from "./components/payments-monthly-section";
import { PermanentStudentDeletion } from "./components/permanent-student-deletion";
import { PlannedLessonStatusButton } from "./components/planned-lesson-status-button";
import { ProgressSignalCard } from "./components/progress-signal-card";
import { StudentArchiveToggle } from "./components/student-archive-toggle";
import { StudentTrendChart } from "./components/student-trend-chart";
import { ChartRangeFilter } from "../../dashboard/components/chart-range-filter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StudentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    lessonUpdated?: string;
    lessonCompleted?: string;
    lessonsMonth?: string;
    paymentsMonth?: string;
    archived?: string;
    range?: string;
  }>;
};

type Lesson = {
  id: string;
  lesson_at: string;
  topics: string;
  topic_tags: string[] | null;
  went_well: string | null;
  parent_note: string | null;
  improve: string | null;
  homework: string | null;
  fee_pence: number;
  confidence: number;
  effort: number;
  status: "planned" | "completed" | "cancelled" | null;
};

type Payment = PaymentLike & {
  payment_date: string | null;
  note: string | null;
  created_at: string;
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

function parseMonthParam(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  return value;
}

function cleanLessonText(value: string) {
  return value
    .split(/\n|;/)
    .map((part) => part.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function isCompletedLessonStatus(status: "planned" | "completed" | "cancelled" | null) {
  return status === "completed" || status === null;
}

export default async function StudentDetailPage({ params, searchParams }: StudentPageProps) {
  noStore();

  const { id } = await params;
  const search = await searchParams;
  const { lessonUpdated, lessonCompleted } = search;
  const supabase = await createSupabaseServerClient();

  const studentQuery = supabase
    .from("students")
    .select(
      "id, student_name, subject, parent_name, parent_contact, parent_email, notes, created_at, archived_at, default_fee_pence",
    )
    .eq("id", id)
    .maybeSingle();

  const lessonsQuery = () =>
    supabase
      .from("lessons")
      .select(
        "id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, fee_pence, confidence, effort, status",
      )
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const fallbackLessonsQuery = () =>
    supabase
      .from("lessons")
      .select("id, lesson_at, topics, went_well, parent_note, improve, homework, fee_pence, confidence, effort, status")
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const [
    { data: student, error: studentError },
    initialLessonsResult,
    paymentsResult,
    currencyCode,
    timeZone,
  ] = await Promise.all([
    studentQuery,
    lessonsQuery(),
    supabase
      .from("payments")
      .select("id, amount_pence, payment_date, source, note, created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    getUserCurrencyCode(supabase),
    getUserTimeZone(supabase),
  ]);

  let lessonsData = initialLessonsResult.data;
  let lessonsError = initialLessonsResult.error;

  if (
    lessonsError &&
    (lessonsError.message.toLowerCase().includes("topic_tags") ||
      lessonsError.details?.toLowerCase().includes("topic_tags"))
  ) {
    const fallbackResult = await fallbackLessonsQuery();
    lessonsData =
      fallbackResult.data?.map((lesson) => ({
        ...lesson,
        topic_tags: null,
      })) ?? null;
    lessonsError = fallbackResult.error;
  }

  if (studentError || !student) {
    notFound();
  }

  const lessons: Lesson[] = lessonsData ?? [];
  const lessonIds = lessons.map((lesson) => lesson.id);
  const allocationsResult =
    lessonIds.length > 0
      ? await supabase
          .from("payment_allocations")
          .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
          .in("lesson_id", lessonIds)
      : { data: [], error: null };
  const payments = (paymentsResult.data ?? []) as Payment[];
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const completedLessons = lessons.filter((lesson) => isCompletedLessonStatus(lesson.status));
  const plannedLessons = [...lessons]
    .filter((lesson) => lesson.status === "planned")
    .sort((a, b) => new Date(a.lesson_at).getTime() - new Date(b.lesson_at).getTime());
  const plannedLessonPartitions = partitionPlannedLessons(plannedLessons, new Date(), timeZone);
  const plannedLessonSections = [
    {
      key: "overdue",
      title: "Needs completing",
      lessons: plannedLessonPartitions.overdue,
      cardClassName: "border-amber-200 bg-amber-50/70",
      badgeClassName: "border-amber-300 bg-amber-100 text-amber-900",
      badgeLabel: "Needs completing",
    },
    {
      key: "today",
      title: "Today’s lessons",
      lessons: plannedLessonPartitions.today,
      cardClassName: "border-blue-300 bg-blue-50",
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-900",
      badgeLabel: "Today",
    },
    {
      key: "upcoming",
      title: "Next lessons",
      lessons: plannedLessonPartitions.upcoming,
      cardClassName: "border-blue-200 bg-blue-50/60",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-800",
      badgeLabel: "Upcoming",
    },
  ].filter((section) => section.lessons.length > 0);
  const isArchived = Boolean(student.archived_at);
  const totalLessons = completedLessons.length;
  const outstandingAmountPence = completedLessons.reduce(
    (sum, lesson) => sum + getOutstandingLessonAmount(lesson, allocations),
    0,
  );
  const studentCreditPence = calculateStudentCredit(payments, allocations);
  const selectedRange = getReportingRange(search.range);
  const rangeLabel = getReportingRangeLabel(selectedRange);
  const paymentsInRange = payments.filter((payment) =>
    isInReportingRange(
      getPaymentReportingDate({ ...payment, student_id: id }),
      selectedRange,
      new Date(),
      timeZone,
    ),
  );
  const receivedInRangePence = paymentsInRange.reduce(
    (sum, payment) => sum + payment.amount_pence,
    0,
  );
  const completedLessonsInRange = completedLessons.filter((lesson) =>
    isInReportingRange(lesson.lesson_at, selectedRange, new Date(), timeZone),
  );
  const lastPayment = payments.reduce<Payment | null>((latest, payment) => {
    if (!latest) {
      return payment;
    }

    return new Date(payment.payment_date ?? payment.created_at) >
      new Date(latest.payment_date ?? latest.created_at)
      ? payment
      : latest;
  }, null);
  const hasStudentFinancialError = Boolean(
    lessonsError || paymentsResult.error || allocationsResult.error,
  );
  const currentMonthKey = getMonthKeyLocal(new Date(), timeZone);
  const initialLessonsMonthKey = parseMonthParam(search.lessonsMonth) ?? currentMonthKey;
  const initialPaymentsMonthKey = parseMonthParam(search.paymentsMonth) ?? currentMonthKey;
  const latestLessonDate =
    totalLessons > 0
      ? formatDateTimeLocal(completedLessons[0].lesson_at, timeZone)
      : "No lessons yet";
  const avgConfidence =
    totalLessons > 0
      ? (completedLessons.reduce((sum, lesson) => sum + lesson.confidence, 0) / totalLessons).toFixed(1)
      : "-";
  const avgEffort =
    totalLessons > 0
      ? (completedLessons.reduce((sum, lesson) => sum + lesson.effort, 0) / totalLessons).toFixed(1)
      : "-";
  const latestConfidenceLessons = completedLessons.slice(0, 3);
  const previousConfidenceLessons = completedLessons.slice(3, 6);
  const latestConfidenceAverage =
    latestConfidenceLessons.length > 0
      ? latestConfidenceLessons.reduce((sum, lesson) => sum + lesson.confidence, 0) /
        latestConfidenceLessons.length
      : null;
  const previousConfidenceAverage =
    previousConfidenceLessons.length > 0
      ? previousConfidenceLessons.reduce((sum, lesson) => sum + lesson.confidence, 0) /
        previousConfidenceLessons.length
      : null;
  const progressSignal =
    latestConfidenceLessons.length === 3 && previousConfidenceLessons.length > 0
      ? (() => {
          const latestAverage = latestConfidenceAverage ?? 0;
          const previousAverage = previousConfidenceAverage ?? 0;
          const difference = latestAverage - previousAverage;

          if (difference >= 0.5) {
            return {
              label: "Improving",
              detail: "Confidence is trending up across recent lessons.",
            };
          }

          if (difference <= -0.5) {
            return {
              label: "Needs attention",
              detail: "Recent confidence is lower than the previous run of lessons.",
            };
          }

          return {
            label: "Stable",
            detail: "Confidence has stayed broadly steady across recent lessons.",
          };
        })()
      : {
          label: "Not enough data yet",
          detail: "Log a few more lessons to spot a meaningful confidence trend.",
        };
  const progressExplanation =
    latestConfidenceAverage !== null && previousConfidenceAverage !== null
      ? `Based on the latest ${latestConfidenceLessons.length} lessons averaging ${latestConfidenceAverage.toFixed(1)}/5 compared with the previous ${previousConfidenceLessons.length} averaging ${previousConfidenceAverage.toFixed(1)}/5.`
      : "This signal appears once there are at least 4 lessons, using the latest 3 confidence scores compared with the previous run of lessons.";
  const progressTone =
    progressSignal.label === "Improving"
      ? "improving"
      : progressSignal.label === "Needs attention"
        ? "attention"
        : progressSignal.label === "Stable"
          ? "stable"
          : "neutral";

  const chronologicalLessons = [...completedLessons].reverse();
  const latestCompletedLesson = completedLessons[0] ?? null;
  const attentionLesson =
    plannedLessonPartitions.overdue[0] ??
    plannedLessonPartitions.today[0] ??
    plannedLessonPartitions.upcoming[0] ??
    null;
  const attentionLessonLabel =
    plannedLessonPartitions.overdue.length > 0
      ? "Needs completing"
      : plannedLessonPartitions.today.length > 0
        ? "Today’s lesson"
        : attentionLesson
          ? "Next lesson"
          : "Next lesson";
  const learningTrendPoints = chronologicalLessons.slice(-10).map((lesson) => ({
    label: formatShortDateLocal(lesson.lesson_at, timeZone),
    confidence: lesson.confidence,
    effort: lesson.effort,
  }));

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">{student.student_name}</h1>
        {student.subject ? (
          <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {student.subject}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-zinc-600">Profile, progress, and lesson history.</p>

      {isArchived ? (
        <div className="mt-4 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3">
          <p className="font-medium text-zinc-950">Archived student</p>
          <p className="mt-1 text-sm text-zinc-700">
            This profile is read-only. Restore the student before editing details, lessons or
            payments.
          </p>
        </div>
      ) : search.archived === "1" ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-800"
        >
          This student is archived. Restore the student before making changes.
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        {isArchived ? (
          <StudentArchiveToggle studentId={student.id} isArchived />
        ) : (
          <>
            <Link
              href={`/app/students/${student.id}/new-lesson`}
              className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Log lesson
            </Link>
            <Link
              href={`/app/students/${student.id}/schedule-lesson`}
              className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Schedule lesson
            </Link>
          </>
        )}
      </div>

      {lessonUpdated === "1" ? (
        <div className="mt-4">
          <LessonSuccessPanel
            title="Lesson updated"
            description="The lesson is now saved on the student page."
          />
        </div>
      ) : null}

      {lessonCompleted === "1" ? (
        <CompletedLessonUpdateBanner studentId={student.id} />
      ) : null}

      <section className="mt-6" aria-labelledby="student-overview-heading">
        <h2 id="student-overview-heading" className="text-lg font-medium text-zinc-900">
          At a glance
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          The next update, payment position and lesson for this student.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <article className="flex min-w-0 flex-col rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-600">Parent update</h3>
            {latestCompletedLesson ? (
              <>
                <p className="mt-2 break-words text-base font-semibold text-zinc-900">Ready to share</p>
                <p className="mt-1 text-sm text-zinc-600">
                  From {formatDateLocal(latestCompletedLesson.lesson_at, timeZone)}
                </p>
                {isArchived ? (
                  <Link
                    href="#latest-parent-update"
                    className="mt-auto inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View update
                  </Link>
                ) : (
                  <LessonUpdateActions
                    reserveFeedbackSpace={false}
                    className="mt-auto pt-4"
                    buttonClassName="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    message={formatParentUpdate(
                      student.student_name,
                      {
                        lessonAt: latestCompletedLesson.lesson_at,
                        topics: latestCompletedLesson.topics ?? "",
                        wentWell: latestCompletedLesson.went_well ?? "",
                        parentNote: latestCompletedLesson.parent_note ?? "",
                        improve: latestCompletedLesson.improve ?? "",
                        homework: latestCompletedLesson.homework ?? "",
                        effort: latestCompletedLesson.effort,
                        confidence: latestCompletedLesson.confidence,
                      },
                      timeZone,
                    )}
                  />
                )}
              </>
            ) : (
              <>
                <p className="mt-2 text-base font-semibold text-zinc-900">No update yet</p>
                <p className="mt-1 text-sm text-zinc-600">Log a lesson to create the first parent update.</p>
                {!isArchived ? (
                  <Link
                    href={`/app/students/${student.id}/new-lesson`}
                    className="mt-auto inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Log lesson
                  </Link>
                ) : null}
              </>
            )}
          </article>

          <article className="flex min-w-0 flex-col rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-600">Outstanding</h3>
            {hasStudentFinancialError ? (
              <p className="mt-2 text-sm font-medium text-rose-800">Could not load the current balance.</p>
            ) : (
              <>
                <p className="mt-2 break-words text-xl font-semibold text-amber-900">
                  {formatCurrencyFromMinorUnits(outstandingAmountPence, currencyCode)}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {outstandingAmountPence > 0 ? "Currently owed" : "Nothing owed now"}
                </p>
              </>
            )}
            <Link
              href={outstandingAmountPence > 0 && !isArchived ? "#payment-history" : "#money"}
              className="mt-auto inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {outstandingAmountPence > 0 && !isArchived ? "Record payment" : "View money"}
            </Link>
          </article>

          <article className="flex min-w-0 flex-col rounded-lg border border-zinc-200 bg-white p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-600">{attentionLessonLabel}</h3>
            {attentionLesson ? (
              <>
                <p className="mt-2 text-base font-semibold text-zinc-900">
                  {formatDateLocal(attentionLesson.lesson_at, timeZone)}
                </p>
                <p className="mt-1 text-sm text-zinc-600">{formatTimeLocal(attentionLesson.lesson_at, timeZone)}</p>
                <Link
                  href="#student-schedule"
                  className="mt-auto inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  View lesson
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-base font-semibold text-zinc-900">Not scheduled</p>
                <p className="mt-1 text-sm text-zinc-600">There is no upcoming lesson.</p>
                {!isArchived ? (
                  <Link
                    href={`/app/students/${student.id}/schedule-lesson`}
                    className="mt-auto inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Schedule lesson
                  </Link>
                ) : null}
              </>
            )}
          </article>
        </div>
      </section>

      <section id="latest-parent-update" className="mt-6 scroll-mt-24">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          {latestCompletedLesson ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <h2 className="text-lg font-medium text-zinc-900">Latest parent update</h2>
                    <p className="text-sm text-zinc-500">
                      {formatDateLocal(latestCompletedLesson.lesson_at, timeZone)} at {formatTimeLocal(latestCompletedLesson.lesson_at, timeZone)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                  <Link
                    href={`/app/students/${student.id}/lessons/${latestCompletedLesson.id}/view`}
                    className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View lesson notes
                  </Link>
                </div>
              </div>

              {/* The parent update stays focused on shareable, next-session useful details; full notes live on the lesson page. */}
              <div className="mt-2 rounded-lg border border-zinc-200 bg-neutral-50 p-3">
                <p className="line-clamp-2 break-words text-sm font-medium leading-6 text-zinc-900 sm:line-clamp-3 sm:text-[15px]">
                  {cleanLessonText(latestCompletedLesson.topics) || "No focus captured yet."}
                </p>
                {latestCompletedLesson.improve || latestCompletedLesson.homework ? (
                  <div className="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm leading-6 text-zinc-700">
                    {latestCompletedLesson.improve ? (
                      <div className="grid gap-0.5 py-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                        <p className="text-sm font-medium text-zinc-900">Improve</p>
                        <p className="line-clamp-2 break-words">{cleanLessonText(latestCompletedLesson.improve)}</p>
                      </div>
                    ) : null}
                    {latestCompletedLesson.homework ? (
                      <div className="grid gap-0.5 py-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                        <p className="text-sm font-medium text-zinc-900">Homework</p>
                        <p className="line-clamp-2 break-words">{cleanLessonText(latestCompletedLesson.homework)}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                    Effort {latestCompletedLesson.effort}/5
                  </span>
                  <span className="inline-flex rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                    Confidence {latestCompletedLesson.confidence}/5
                  </span>
                  {latestCompletedLesson.topic_tags && latestCompletedLesson.topic_tags.length > 0
                    ? latestCompletedLesson.topic_tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex max-w-full rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                        >
                          <span className="break-all">{tag}</span>
                        </span>
                      ))
                    : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium text-zinc-900">Latest parent update</h2>
              <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">No lesson notes yet.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Log a lesson to start building this student&apos;s history.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {plannedLessons.length > 0 ? (
          <div id="student-schedule" className="scroll-mt-24 space-y-4">
            {plannedLessonSections.map((section) => (
              <section key={section.key} className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="text-lg font-medium text-zinc-900">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.lessons.map((lesson) => {
                    const plannedTopic =
                      lesson.topics && lesson.topics !== "Planned lesson" ? cleanLessonText(lesson.topics) : null;
                    const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);

                    return (
                      <div
                        key={lesson.id}
                        className={`rounded-lg border p-4 ${section.cardClassName}`}
                      >
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                            <span>{formatDateLocal(lesson.lesson_at, timeZone)} at {formatTimeLocal(lesson.lesson_at, timeZone)}</span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${section.badgeClassName}`}
                            >
                              {section.badgeLabel}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                            >
                              {getPaymentStatusLabel(paymentStatus)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {plannedTopic || "No planned topic or note yet."}
                          </p>
                          {isArchived ? (
                            <span className="mt-3 inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                              Read-only
                            </span>
                          ) : (
                            <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                              <Link
                                href={`/app/students/${student.id}/lessons/${lesson.id}?mode=complete`}
                                className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                              >
                                Complete lesson
                              </Link>
                              <Link
                                href={`/app/students/${student.id}/lessons/${lesson.id}`}
                                className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                              >
                                Reschedule
                              </Link>
                              <PlannedLessonStatusButton
                                lessonId={lesson.id}
                                studentId={student.id}
                                nextStatus="cancelled"
                                label="Cancel lesson"
                                className="min-h-10 w-full whitespace-nowrap border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5" aria-labelledby="learning-progress-heading">
          <h2 id="learning-progress-heading" className="text-lg font-medium text-zinc-900">
            Learning progress
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            A concise view of this student&apos;s recent lessons and learning signals.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-zinc-200 py-4 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Last lesson</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-zinc-900">{latestLessonDate}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total lessons</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-900">{totalLessons}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Avg confidence</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-900">{avgConfidence}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Avg effort</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-900">{avgEffort}</dd>
            </div>
          </dl>
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <ProgressSignalCard
              label={progressSignal.label}
              detail={progressSignal.detail}
              explanation={progressExplanation}
              tone={progressTone}
            />
            <StudentTrendChart points={learningTrendPoints} />
          </div>
        </section>

        <section>
          <MonthlySummaryGenerator
            studentName={student.student_name}
            lessons={completedLessons}
            timeZone={timeZone}
          />
        </section>

        <PastLessonsMonthlySection
          studentId={student.id}
          lessons={completedLessons}
          allocations={allocations}
          currencyCode={currencyCode}
          initialMonthKey={initialLessonsMonthKey}
          timeZone={timeZone}
          hasLessonsError={Boolean(lessonsError)}
          readOnly={isArchived}
        />

        <section id="money" className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5" aria-labelledby="student-money-heading">
          <h2 id="student-money-heading" className="text-lg font-medium text-zinc-900">
            Money
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Received and completed use the selected timeframe. Outstanding is what is owed now.
          </p>
          <div className="mt-3">
            <ChartRangeFilter selected={selectedRange} basePath={`/app/students/${student.id}`} />
          </div>

          {hasStudentFinancialError ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              Could not load this student&apos;s payment summary.
            </p>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-600">Received</dt>
                <dd className="mt-1.5 break-words text-xl font-semibold text-emerald-900 sm:text-2xl">
                  {formatCurrencyFromMinorUnits(receivedInRangePence, currencyCode)}
                </dd>
                <dd className="mt-1 text-xs text-zinc-600">{rangeLabel}</dd>
              </div>
              <div className="min-w-0 rounded-lg border border-amber-200 bg-amber-50/50 p-3 sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-600">Outstanding now</dt>
                <dd className="mt-1.5 break-words text-xl font-semibold text-amber-900 sm:text-2xl">
                  {formatCurrencyFromMinorUnits(outstandingAmountPence, currencyCode)}
                </dd>
                <dd className="mt-1 text-xs text-zinc-600">Current balance</dd>
              </div>
              <div className="min-w-0 rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-600">Completed lessons</dt>
                <dd className="mt-1.5 text-xl font-semibold text-blue-900 sm:text-2xl">
                  {completedLessonsInRange.length}
                </dd>
                <dd className="mt-1 text-xs text-zinc-600">{rangeLabel}</dd>
              </div>
              <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-600">Last payment</dt>
                {lastPayment ? (
                  <>
                    <dd className="mt-1.5 break-words text-xl font-semibold text-zinc-900 sm:text-2xl">
                      {formatCurrencyFromMinorUnits(lastPayment.amount_pence, currencyCode)}
                    </dd>
                    <dd className="mt-1 text-xs text-zinc-600">
                      {formatDateLocal(lastPayment.payment_date ?? lastPayment.created_at, timeZone)}
                    </dd>
                  </>
                ) : (
                  <dd className="mt-2 text-sm font-medium text-zinc-600">No payments yet</dd>
                )}
              </div>
            </dl>
          )}
        </section>

        <PaymentsMonthlySection
          studentId={student.id}
          payments={payments}
          studentCreditPence={studentCreditPence}
          currencyCode={currencyCode}
          initialMonthKey={initialPaymentsMonthKey}
          timeZone={timeZone}
          readOnly={isArchived}
        />
      </div>

      {isArchived ? null : (
        <section className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4" aria-labelledby="student-settings-heading">
          <h2 id="student-settings-heading" className="text-base font-medium text-zinc-900">
            Student settings
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Update this student&apos;s details or move their profile out of the active list.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/app/students/${student.id}/edit`}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Edit student
            </Link>
            <StudentArchiveToggle studentId={student.id} isArchived={false} />
          </div>
        </section>
      )}

      {isArchived ? (
        <PermanentStudentDeletion studentId={student.id} studentName={student.student_name} />
      ) : null}

      <div className="mt-6">
        <Link href="/app/students" className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline">
          Back to students
        </Link>
      </div>

      {isArchived ? null : (
        <Link
          href={`/app/students/${student.id}/new-lesson`}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center rounded-full bg-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-600 sm:hidden"
        >
          + Lesson
        </Link>
      )}
    </section>
  );
}
