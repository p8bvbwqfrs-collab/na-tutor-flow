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
import { getUserCurrencyCode } from "@/lib/user-settings";
import { formatParentUpdate } from "@/lib/parent-update";
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
import { MonthlySummaryGenerator } from "./components/monthly-summary-generator";
import { PastLessonsMonthlySection } from "./components/past-lessons-monthly-section";
import { PaymentsMonthlySection } from "./components/payments-monthly-section";
import { PlannedLessonStatusButton } from "./components/planned-lesson-status-button";
import { ProgressSignalCard } from "./components/progress-signal-card";
import { StudentArchiveToggle } from "./components/student-archive-toggle";
import { StudentTrendChart } from "./components/student-trend-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StudentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    lessonUpdated?: string;
    lessonCompleted?: string;
    lessonsMonth?: string;
    paymentsMonth?: string;
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
  paid: boolean;
  confidence: number;
  effort: number;
  status: "planned" | "completed" | "cancelled" | null;
};

type Payment = PaymentLike & {
  payment_date: string | null;
  covers_from: string | null;
  covers_to: string | null;
  sessions_covered: number | null;
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

  return new Date(Date.UTC(year, month - 1, 1));
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
      "id, student_name, parent_name, parent_contact, parent_email, notes, created_at, archived_at, default_fee_pence",
    )
    .eq("id", id)
    .maybeSingle();

  const lessonsQuery = () =>
    supabase
      .from("lessons")
      .select(
        "id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, fee_pence, paid, confidence, effort, status",
      )
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const fallbackLessonsQuery = () =>
    supabase
      .from("lessons")
      .select("id, lesson_at, topics, went_well, parent_note, improve, homework, fee_pence, paid, confidence, effort, status")
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const [
    { data: student, error: studentError },
    initialLessonsResult,
    paymentsResult,
    currencyCode,
  ] = await Promise.all([
    studentQuery,
    lessonsQuery(),
    supabase
      .from("payments")
      .select("id, amount_pence, payment_date, covers_from, covers_to, sessions_covered, source, note, created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    getUserCurrencyCode(supabase),
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
  const isArchived = Boolean(student.archived_at);
  const totalLessons = completedLessons.length;
  const outstandingAmountPence = completedLessons.reduce(
    (sum, lesson) => sum + getOutstandingLessonAmount(lesson, allocations),
    0,
  );
  const studentCreditPence = calculateStudentCredit(payments, allocations);
  const defaultMonthStart = new Date();
  const lessonsMonthStart =
    parseMonthParam(search.lessonsMonth) ??
    new Date(Date.UTC(defaultMonthStart.getUTCFullYear(), defaultMonthStart.getUTCMonth(), 1));
  const paymentsMonthStart =
    parseMonthParam(search.paymentsMonth) ??
    new Date(Date.UTC(defaultMonthStart.getUTCFullYear(), defaultMonthStart.getUTCMonth(), 1));
  const initialLessonsMonthKey = getMonthKeyLocal(lessonsMonthStart);
  const initialPaymentsMonthKey = getMonthKeyLocal(paymentsMonthStart);
  const latestLessonDate =
    totalLessons > 0 ? formatDateTimeLocal(completedLessons[0].lesson_at) : "No lessons yet";
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
  const confidenceTrendPoints = chronologicalLessons.map((lesson) => ({
    label: formatShortDateLocal(lesson.lesson_at),
    value: lesson.confidence,
  }));
  const effortTrendPoints = chronologicalLessons.map((lesson) => ({
    label: formatShortDateLocal(lesson.lesson_at),
    value: lesson.effort,
  }));

  return (
    <section>
      <h1 className="text-xl font-semibold text-zinc-900">{student.student_name}</h1>
      <p className="mt-1 text-sm text-zinc-600">Profile, progress, and lesson history.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/app/students/${student.id}/new-lesson`}
          className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Log lesson
        </Link>
        <Link
          href={`/app/students/${student.id}/schedule-lesson`}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Schedule lesson
        </Link>
        <Link
          href={`/app/students/${student.id}/edit`}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Edit student
        </Link>
        <StudentArchiveToggle studentId={student.id} isArchived={isArchived} />
      </div>

      {lessonUpdated === "1" ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          Lesson updated
        </p>
      ) : null}

      {lessonCompleted === "1" ? (
        <CompletedLessonUpdateBanner studentId={student.id} />
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Last lesson</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900">{latestLessonDate}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total lessons</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalLessons}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Outstanding amount</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {formatCurrencyFromMinorUnits(outstandingAmountPence, currencyCode)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Average confidence</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{avgConfidence}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Average student effort</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{avgEffort}</p>
        </div>
        <ProgressSignalCard
          label={progressSignal.label}
          detail={progressSignal.detail}
          explanation={progressExplanation}
          tone={progressTone}
        />
      </div>

      <section className="mt-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          {latestCompletedLesson ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <h2 className="text-lg font-medium text-zinc-900">Latest notes</h2>
                    <p className="text-sm text-zinc-500">
                      {formatDateLocal(latestCompletedLesson.lesson_at)} at {formatTimeLocal(latestCompletedLesson.lesson_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                  <Link
                    href={`/app/students/${student.id}/lessons/${latestCompletedLesson.id}/view`}
                    className="inline-flex min-h-9 items-center justify-center rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View notes
                  </Link>
                  <LessonUpdateActions
                    reserveFeedbackSpace={false}
                    message={formatParentUpdate(student.student_name, {
                      lessonAt: latestCompletedLesson.lesson_at,
                      topics: latestCompletedLesson.topics ?? "",
                      wentWell: latestCompletedLesson.went_well ?? "",
                      parentNote: latestCompletedLesson.parent_note ?? "",
                      improve: latestCompletedLesson.improve ?? "",
                      homework: latestCompletedLesson.homework ?? "",
                      effort: latestCompletedLesson.effort,
                      confidence: latestCompletedLesson.confidence,
                    })}
                  />
                </div>
              </div>

              {/* Latest notes stays focused on next-session useful details; full notes live on the lesson page. */}
              <div className="mt-2 rounded-lg border border-zinc-200 bg-neutral-50 p-3">
                <p className="text-sm font-medium leading-6 text-zinc-900 sm:text-[15px]">
                  {cleanLessonText(latestCompletedLesson.topics) || "No focus captured yet."}
                </p>
                {latestCompletedLesson.improve || latestCompletedLesson.homework ? (
                  <div className="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm leading-6 text-zinc-700">
                    {latestCompletedLesson.improve ? (
                      <div className="grid gap-0.5 py-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                        <p className="text-sm font-medium text-zinc-900">Improve</p>
                        <p>{cleanLessonText(latestCompletedLesson.improve)}</p>
                      </div>
                    ) : null}
                    {latestCompletedLesson.homework ? (
                      <div className="grid gap-0.5 py-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                        <p className="text-sm font-medium text-zinc-900">Homework</p>
                        <p>{cleanLessonText(latestCompletedLesson.homework)}</p>
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
                          className="inline-flex rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium text-zinc-900">Latest notes</h2>
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
          <section>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-medium text-zinc-900">Upcoming lessons</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Scheduled lessons you can complete when the session is done.
              </p>
              <div className="mt-4 space-y-3">
                {plannedLessons.map((lesson) => {
                  const plannedTopic =
                    lesson.topics && lesson.topics !== "Planned lesson" ? cleanLessonText(lesson.topics) : null;

                  return (
                    <div
                      key={lesson.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          {(() => {
                            const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);

                            return (
                              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                                <span>{formatDateLocal(lesson.lesson_at)} at {formatTimeLocal(lesson.lesson_at)}</span>
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                                >
                                  {getPaymentStatusLabel(paymentStatus)}
                                </span>
                              </p>
                            );
                          })()}
                          <p className="mt-1 text-sm text-zinc-600">
                            {plannedTopic || "No planned topic or note yet."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-start gap-2">
                          <Link
                            href={`/app/students/${student.id}/lessons/${lesson.id}?mode=complete`}
                            className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                          >
                            Complete lesson
                          </Link>
                          <Link
                            href={`/app/students/${student.id}/lessons/${lesson.id}`}
                            className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                          >
                            Edit
                          </Link>
                          <PlannedLessonStatusButton
                            lessonId={lesson.id}
                            nextStatus="cancelled"
                            label="Cancel lesson"
                            className="min-h-10 border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section>
          <MonthlySummaryGenerator studentName={student.student_name} lessons={completedLessons} />
        </section>

        <section>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-medium text-zinc-900">Trends</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <StudentTrendChart title="Confidence over time" points={confidenceTrendPoints} />
              <StudentTrendChart title="Student effort over time" points={effortTrendPoints} />
            </div>
          </div>
        </section>

        <PastLessonsMonthlySection
          studentId={student.id}
          lessons={completedLessons}
          allocations={allocations}
          currencyCode={currencyCode}
          initialMonthKey={initialLessonsMonthKey}
          hasLessonsError={Boolean(lessonsError)}
        />

        <PaymentsMonthlySection
          studentId={student.id}
          payments={payments}
          studentCreditPence={studentCreditPence}
          currencyCode={currencyCode}
          initialMonthKey={initialPaymentsMonthKey}
        />
      </div>

      <div className="mt-6">
        <Link href="/app/students" className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline">
          Back to students
        </Link>
      </div>

      <Link
        href={`/app/students/${student.id}/new-lesson`}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-zinc-700 sm:hidden"
      >
        + Lesson
      </Link>
    </section>
  );
}
