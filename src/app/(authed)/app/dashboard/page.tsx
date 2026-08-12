import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrencyFromMinorUnits } from "@/lib/currency";
import { formatDateTimeLocal } from "@/lib/datetime";
import {
  buildIncomeTrendSeries,
  buildStudentFinancialSummaries,
  getPaymentReportingDate,
  getReportingRange,
  getReportingRangeLabel,
  isInReportingRange,
} from "@/lib/financial-reporting";
import { partitionPlannedLessons } from "@/lib/lesson-attention";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatParentUpdate } from "@/lib/parent-update";
import {
  calculateLessonPaymentStatus,
  getPaidAllocatedAmountForLesson,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
  type PaymentLike,
} from "@/lib/payments";
import { getUserCurrencyCode, getUserTimeZone } from "@/lib/user-settings";
import { PlannedLessonStatusButton } from "../students/[id]/components/planned-lesson-status-button";
import { MarkPaidButton } from "./components/mark-paid-button";
import { IncomeTrendChart } from "./components/income-trend-chart";
import { ChartRangeFilter } from "./components/chart-range-filter";
import { ShareUpdateButton } from "./components/copy-update-button";
import { deriveDashboardExperience, getDashboardActions } from "./dashboard-onboarding";

type LessonRow = {
  id: string;
  lesson_at: string;
  fee_pence: number;
  student_id: string;
  status: "planned" | "completed" | "cancelled" | null;
  student: DashboardStudentRelation | DashboardStudentRelation[] | null;
};

type DashboardStudentRelation = {
  student_name: string;
  archived_at?: string | null;
};

type DashboardLessonOverviewRow = {
  id: string;
  student_id: string;
  lesson_at: string;
  status: "planned" | "completed" | "cancelled" | null;
  fee_pence: number;
  topics?: string | null;
  went_well?: string | null;
  parent_note?: string | null;
  improve?: string | null;
  homework?: string | null;
  effort?: number | null;
  confidence?: number | null;
  student: DashboardStudentRelation | DashboardStudentRelation[] | null;
};

type DashboardPaymentRow = PaymentLike & {
  student_id: string;
  payment_date: string | null;
  created_at: string;
};

type DashboardAllocationRow = {
  payment_id: string;
  lesson_id: string;
  amount_pence: number;
  payment: PaymentLike | PaymentLike[] | null;
};

type DashboardStudentRow = {
  id: string;
  student_name: string;
  archived_at: string | null;
};

function getPayment(payment: PaymentLike | PaymentLike[] | null | undefined) {
  return Array.isArray(payment) ? (payment[0] ?? null) : (payment ?? null);
}

function getStudentName(student: DashboardStudentRelation | DashboardStudentRelation[] | null | undefined) {
  return getStudent(student)?.student_name ?? null;
}

function getStudent(student: DashboardStudentRelation | DashboardStudentRelation[] | null | undefined) {
  if (!student) {
    return null;
  }

  if (Array.isArray(student)) {
    return student[0] ?? null;
  }

  return student;
}

function isCompletedLessonStatus(status: "planned" | "completed" | "cancelled" | null) {
  return status === "completed" || status === null;
}

function cleanLessonText(value: string) {
  return value
    .split(/\n|;/)
    .map((part) => part.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

type DashboardPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { range } = await searchParams;
  const selectedRange = getReportingRange(range);
  const supabase = await createSupabaseServerClient();
  const [currencyCode, timeZone] = await Promise.all([
    getUserCurrencyCode(supabase),
    getUserTimeZone(supabase),
  ]);

  const now = new Date();

  const [
    activeStudentsResult,
    recentLessonsResult,
    plannedLessonsResult,
    paymentsResult,
    paymentAllocationsResult,
    derivedLessonsResult,
  ] = await Promise.all([
    supabase.from("students").select("id, student_name, archived_at"),
    supabase
      .from("lessons")
      .select(
        "id, student_id, lesson_at, status, fee_pence, topics, went_well, parent_note, improve, homework, effort, confidence, student:students!lessons_student_id_fkey(student_name)",
      )
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(3),
    supabase
      .from("lessons")
      .select(
        "id, student_id, lesson_at, status, fee_pence, student:students!lessons_student_id_fkey(student_name, archived_at)",
      )
      .eq("status", "planned")
      .order("lesson_at", { ascending: true }),
    supabase.from("payments").select("id, student_id, amount_pence, payment_date, source, note, created_at"),
    supabase
      .from("payment_allocations")
      .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)"),
    supabase
      .from("lessons")
      .select("id, lesson_at, fee_pence, student_id, status, student:students!lessons_student_id_fkey(student_name)")
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false }),
  ]);
  const dashboardStudentRows = (activeStudentsResult.data ?? []) as DashboardStudentRow[];
  const dashboardStudents = dashboardStudentRows.map((student) => ({
    id: student.id,
    studentName: student.student_name,
    archivedAt: student.archived_at,
  }));
  const hasAnyLessons = Boolean(
    (derivedLessonsResult.data ?? []).length > 0 || (plannedLessonsResult.data ?? []).length > 0,
  );
  const dashboardExperience = deriveDashboardExperience(dashboardStudents, hasAnyLessons);
  const dashboardActions = getDashboardActions(dashboardExperience.state, dashboardExperience.activeStudents);
  const activeStudentsCount = dashboardExperience.activeStudents.length;
  const recentLessons = ((recentLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter((lesson) =>
    isCompletedLessonStatus(lesson.status),
  );
  const plannedLessons = ((plannedLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter(
    (lesson) => lesson.status === "planned" && !getStudent(lesson.student)?.archived_at,
  );
  const plannedLessonPartitions = partitionPlannedLessons(plannedLessons, now, timeZone);
  const plannedLessonSections = [
    {
      key: "overdue",
      title: "Needs completing",
      lessons: plannedLessonPartitions.overdue.slice(0, 3),
      total: plannedLessonPartitions.overdue.length,
      cardClassName: "border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-50",
      badgeClassName: "border-amber-300 bg-amber-100 text-amber-900",
    },
    {
      key: "today",
      title: "Today’s lessons",
      lessons: plannedLessonPartitions.today.slice(0, 3),
      total: plannedLessonPartitions.today.length,
      cardClassName: "border-blue-300 bg-blue-50 hover:border-blue-400",
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-900",
    },
    {
      key: "upcoming",
      title: "Next lessons",
      lessons: plannedLessonPartitions.upcoming.slice(0, 3),
      total: plannedLessonPartitions.upcoming.length,
      cardClassName: "border-blue-200 bg-blue-50/60 hover:border-blue-300 hover:bg-blue-50",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-800",
    },
  ].filter((section) => section.total > 0);
  const payments = (paymentsResult.data ?? []) as DashboardPaymentRow[];
  const paymentAllocations = ((paymentAllocationsResult.data ?? []) as DashboardAllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const derivedLessons = (derivedLessonsResult.data ?? []) as LessonRow[];
  const unpaidLessons = derivedLessons
    .filter((lesson) => {
      return lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations) > 0;
    })
    .slice(0, 20);
  const unpaidTotalPence = derivedLessons.reduce((sum, lesson) => {
    return sum + Math.max(0, lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations));
  }, 0);
  const unpaidLessonsCount = derivedLessons.filter(
    (lesson) => lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations) > 0,
  ).length;
  const reportingPayments = payments.filter((payment) =>
    isInReportingRange(getPaymentReportingDate(payment), selectedRange, now, timeZone),
  );
  const receivedInRangePence = reportingPayments.reduce((sum, payment) => sum + payment.amount_pence, 0);
  const completedLessonsInRange = derivedLessons.filter((lesson) =>
    isInReportingRange(lesson.lesson_at, selectedRange, now, timeZone),
  );
  const studentFinancialSummaries = buildStudentFinancialSummaries(
    dashboardStudentRows,
    payments,
    derivedLessons,
    paymentAllocations,
    selectedRange,
    now,
    timeZone,
  );
  const incomeTrendSeries = buildIncomeTrendSeries(payments, selectedRange, now, timeZone);
  const rangeLabel = getReportingRangeLabel(selectedRange);
  const hasDashboardDataError = Boolean(
    activeStudentsResult.error ||
      recentLessonsResult.error ||
      plannedLessonsResult.error ||
      paymentsResult.error ||
      paymentAllocationsResult.error ||
      derivedLessonsResult.error,
  );

  return (
    <section>
      <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>

      {!hasDashboardDataError ? (
        dashboardExperience.state === "no_active_students" ? (
          <section
            className="mt-6 min-w-0 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
            aria-labelledby="dashboard-onboarding-heading"
          >
            <h2 id="dashboard-onboarding-heading" className="text-lg font-medium text-zinc-900">
              Let&apos;s set up Tutor Flow
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Start by adding a student. Their profile will keep lessons, progress and payments in one place.
            </p>
            <Link
              href={dashboardActions[0].href}
              className="mt-4 inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              {dashboardActions[0].label}
            </Link>
          </section>
        ) : dashboardExperience.state === "student_ready" ? (
          <section
            className="mt-6 min-w-0 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
            aria-labelledby="dashboard-onboarding-heading"
          >
            <h2 id="dashboard-onboarding-heading" className="text-lg font-medium text-zinc-900">
              Your student is ready
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Log a completed lesson or schedule the next one to start building their lesson history.
            </p>
            <div className="mt-4 grid min-w-0 gap-2 sm:flex sm:flex-wrap">
              <Link
                href={dashboardActions[0].href}
                className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                {dashboardActions[0].label}
              </Link>
              <Link
                href={dashboardActions[1].href}
                className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                {dashboardActions[1].label}
              </Link>
            </div>
          </section>
        ) : (
          <nav className="mt-5 min-w-0" aria-label="Dashboard quick actions">
            <h2 className="text-sm font-medium text-zinc-700">Quick actions</h2>
            <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <Link
                href={dashboardActions[0].href}
                className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                {dashboardActions[0].label}
              </Link>
              <Link
                href={dashboardActions[1].href}
                className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                {dashboardActions[1].label}
              </Link>
              <Link
                href={dashboardActions[2].href}
                className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                {dashboardActions[2].label}
              </Link>
            </div>
          </nav>
        )
      ) : null}

      <section
        className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
        aria-labelledby="lesson-schedule-heading"
      >
        <SectionHeading
          id="lesson-schedule-heading"
          title="Lesson schedule"
          description="Start with overdue and today’s lessons, then see what is coming next."
        />

        {plannedLessonsResult.error ? (
          <p role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            Could not load the lesson schedule.
          </p>
        ) : plannedLessons.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            No scheduled lessons yet.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {plannedLessonSections.map((section) => (
              <section key={section.key} aria-labelledby={`dashboard-${section.key}-lessons`}>
                <h3 id={`dashboard-${section.key}-lessons`} className="text-sm font-semibold text-zinc-900">
                  {section.title}
                </h3>
                <div className="mt-2 space-y-2">
                  {section.lessons.map((lesson) => {
                    const paymentStatus = calculateLessonPaymentStatus(lesson, paymentAllocations);

                    return (
                      <div
                        key={lesson.id}
                        className={`rounded-lg border p-3 transition-colors ${section.cardClassName}`}
                      >
                        <div className="md:flex md:items-center md:justify-between md:gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="min-w-0 text-sm font-medium text-zinc-900">
                                {getStudentName(lesson.student) ?? "Unknown student"}
                              </p>
                              <span className="text-sm text-zinc-600">{formatDateTimeLocal(lesson.lesson_at, timeZone)}</span>
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${section.badgeClassName}`}
                              >
                                {section.key === "overdue"
                                  ? "Needs completing"
                                  : section.key === "today"
                                    ? "Today"
                                    : "Upcoming"}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                              >
                                {getPaymentStatusLabel(paymentStatus)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap md:mt-0 md:flex-nowrap md:justify-end">
                            <Link
                              href={`/app/students/${lesson.student_id}/lessons/${lesson.id}?mode=complete`}
                              className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                            >
                              Complete lesson
                            </Link>
                            <Link
                              href={`/app/students/${lesson.student_id}/lessons/${lesson.id}`}
                              className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                            >
                              Reschedule
                            </Link>
                            <PlannedLessonStatusButton
                              lessonId={lesson.id}
                              studentId={lesson.student_id}
                              nextStatus="cancelled"
                              label="Cancel lesson"
                              className="min-h-10 w-full whitespace-nowrap border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {section.total > section.lessons.length ? (
                  <Link
                    href="/app/calendar"
                    className="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View {section.total - section.lessons.length} more in Calendar
                  </Link>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </section>

      <section
        className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-5"
        aria-labelledby="money-heading"
      >
        <div>
          <SectionHeading
            id="money-heading"
            title="Money"
            description="Received and completed figures use the selected timeframe. Outstanding is what is owed now."
          />
          <div className="mt-3">
            <ChartRangeFilter
              selected={selectedRange}
              description="Updates received income, completed lessons, the student breakdown and the income chart below. Outstanding and active students stay current."
            />
          </div>
        </div>

        {hasDashboardDataError ? (
          <p role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            Could not load the financial overview.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Received</p>
              <p className="mt-1.5 break-words text-xl font-semibold text-emerald-900 sm:text-2xl">
                {formatCurrencyFromMinorUnits(receivedInRangePence, currencyCode)}
              </p>
              <p className="mt-1 text-xs text-zinc-600">{rangeLabel}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-amber-200 bg-amber-50/50 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Outstanding now</p>
              <p className="mt-1.5 break-words text-xl font-semibold text-amber-900 sm:text-2xl">
                {formatCurrencyFromMinorUnits(unpaidTotalPence, currencyCode)}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {unpaidLessonsCount} unpaid {unpaidLessonsCount === 1 ? "lesson" : "lessons"}
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Completed lessons</p>
              <p className="mt-1.5 text-xl font-semibold text-blue-900 sm:text-2xl">{completedLessonsInRange.length}</p>
              <p className="mt-1 text-xs text-zinc-600">{rangeLabel}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Active students</p>
              <p className="mt-1.5 text-xl font-semibold text-zinc-900 sm:text-2xl">{activeStudentsCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Current</p>
            </div>
          </div>
        )}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section
            className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
            aria-labelledby="student-income-heading"
          >
            <SectionHeading
              id="student-income-heading"
              level={3}
              title="By student"
              description={<>Received and completed use {rangeLabel.toLowerCase()}. Outstanding is the current balance.</>}
            />

            {hasDashboardDataError ? (
              <p
                role="alert"
                className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
              >
                Could not load the student breakdown.
              </p>
            ) : studentFinancialSummaries.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                Add a student to see their payment summary here.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
                {studentFinancialSummaries.map((summary) => (
                  <article key={summary.id} className="p-3 sm:p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={
                          selectedRange === "month"
                            ? `/app/students/${summary.id}`
                            : `/app/students/${summary.id}?range=${selectedRange}`
                        }
                        className="font-medium text-zinc-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        {summary.studentName}
                      </Link>
                      {summary.archivedAt ? (
                        <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                          Archived
                        </span>
                      ) : null}
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2">
                      <div className="min-w-0">
                        <dt className="text-xs text-zinc-500">Received</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-emerald-800">
                          {formatCurrencyFromMinorUnits(summary.receivedPence, currencyCode)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-zinc-500">Outstanding</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-amber-900">
                          {formatCurrencyFromMinorUnits(summary.outstandingPence, currencyCode)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-zinc-500">Lessons</dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-900">{summary.completedLessons}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section
            className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
            aria-labelledby="income-trend-heading"
          >
            <h3 id="income-trend-heading" className="text-lg font-medium text-zinc-900">
              Income over time
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {rangeLabel} · {incomeTrendSeries.viewLabel}
            </p>
            {paymentsResult.error ? (
              <p
                role="alert"
                className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
              >
                Could not load income over time.
              </p>
            ) : reportingPayments.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                No payments received in this timeframe.
              </p>
            ) : (
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-900">
                  {formatCurrencyFromMinorUnits(receivedInRangePence, currencyCode)} received ·{" "}
                  {reportingPayments.length} {reportingPayments.length === 1 ? "payment" : "payments"}
                </p>
                <div className="mt-3">
                  <IncomeTrendChart data={incomeTrendSeries.points} currencyCode={currencyCode} />
                </div>
              </div>
            )}
          </section>
        </div>

        <section
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
          aria-labelledby="unpaid-lessons-heading"
        >
          <h3 id="unpaid-lessons-heading" className="text-lg font-medium text-zinc-900">
            Unpaid lessons
          </h3>

          {hasDashboardDataError ? (
            <p
              role="alert"
              className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              Could not load dashboard data.
            </p>
          ) : unpaidLessons.length === 0 ? (
            hasAnyLessons ? (
              <p className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                No unpaid lessons.
              </p>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Your dashboard will fill in as you go.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Log your first lesson and we&apos;ll start showing payment tracking, recent activity, and earnings
                  insights here.
                </p>
              </div>
            )
          ) : (
            <>
              <div className="mt-4 space-y-3 md:hidden">
                {unpaidLessons.map((lesson) => {
                  const remainingPence = Math.max(
                    0,
                    lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations),
                  );

                  return (
                    <article key={lesson.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <Link
                        href={`/app/students/${lesson.student_id}`}
                        className="font-medium text-zinc-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        {getStudentName(lesson.student) ?? "Unknown student"}
                      </Link>
                      <dl className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs text-zinc-500">Lesson</dt>
                          <dd className="mt-1 text-sm text-zinc-700">{formatDateTimeLocal(lesson.lesson_at, timeZone)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Remaining</dt>
                          <dd className="mt-1 text-sm font-semibold text-amber-900">
                            {formatCurrencyFromMinorUnits(remainingPence, currencyCode)}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-3 grid gap-2">
                        <Link
                          href={`/app/students/${lesson.student_id}/lessons/${lesson.id}/view`}
                          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        >
                          View notes
                        </Link>
                        <MarkPaidButton lessonId={lesson.id} />
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-4 hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-100 text-zinc-700">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Student
                      </th>
                      <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Date
                      </th>
                      <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Remaining
                      </th>
                      <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidLessons.map((lesson, index) => {
                      const remainingPence = Math.max(
                        0,
                        lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations),
                      );

                      return (
                        <tr
                          key={lesson.id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-50"} border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50`}
                        >
                          <td className="px-3 py-2.5 align-middle font-medium text-zinc-900">
                            <Link
                              href={`/app/students/${lesson.student_id}`}
                              className="underline-offset-4 hover:underline"
                            >
                              {getStudentName(lesson.student) ?? "Unknown student"}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 align-middle text-zinc-700">
                            {formatDateTimeLocal(lesson.lesson_at, timeZone)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 align-middle font-semibold text-zinc-900">
                            {formatCurrencyFromMinorUnits(remainingPence, currencyCode)}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start">
                              <Link
                                href={`/app/students/${lesson.student_id}/lessons/${lesson.id}/view`}
                                className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                              >
                                View notes
                              </Link>
                              <MarkPaidButton lessonId={lesson.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </section>

      <section className="mt-8 border-t border-zinc-200 pt-8" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="text-lg font-medium text-zinc-900">
          Recent activity
        </h2>

        <section
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
          aria-labelledby="recent-lessons-heading"
        >
          <h3 id="recent-lessons-heading" className="text-lg font-medium text-zinc-900">
            Recent lessons
          </h3>

          {recentLessonsResult.error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              Could not load recent lessons.
            </p>
          ) : recentLessons.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              No recent lessons yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {(() => {
                    const paymentStatus = calculateLessonPaymentStatus(lesson, paymentAllocations);

                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900">
                          {getStudentName(lesson.student) ?? "Unknown student"}
                        </p>
                        <span className="text-sm text-zinc-600">{formatDateTimeLocal(lesson.lesson_at, timeZone)}</span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                        >
                          {getPaymentStatusLabel(paymentStatus)}
                        </span>
                      </div>
                    );
                  })()}
                  {lesson.topics ? (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-700">{cleanLessonText(lesson.topics)}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-start gap-2">
                    <Link
                      href={`/app/students/${lesson.student_id}/lessons/${lesson.id}/view`}
                      className="inline-flex min-h-9 items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      View notes
                    </Link>
                    {getStudentName(lesson.student) &&
                    lesson.topics &&
                    lesson.effort != null &&
                    lesson.confidence != null ? (
                      <ShareUpdateButton
                        message={formatParentUpdate(
                          getStudentName(lesson.student)!,
                          {
                            lessonAt: lesson.lesson_at,
                            topics: lesson.topics ?? "",
                            wentWell: lesson.went_well ?? "",
                            parentNote: lesson.parent_note ?? "",
                            improve: lesson.improve ?? "",
                            homework: lesson.homework ?? "",
                            effort: lesson.effort,
                            confidence: lesson.confidence,
                          },
                          timeZone,
                        )}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </section>
  );
}
