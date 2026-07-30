import Link from "next/link";
import { formatCurrencyFromMinorUnits } from "@/lib/currency";
import {
  formatDateTimeLocal,
  formatMonthShortLocal,
  getMonthKeyLocal,
} from "@/lib/datetime";
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
import { getLessonStatusClassName, getLessonStatusLabel } from "@/lib/status-styles";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { MarkPaidButton } from "./components/mark-paid-button";
import { MonthlyEarningsChart } from "./components/monthly-earnings-chart";
import { ChartRangeFilter, type ChartRange } from "./components/chart-range-filter";
import { ShareUpdateButton } from "./components/copy-update-button";
import { deriveDashboardExperience, getDashboardActions } from "./dashboard-onboarding";

type LessonRow = {
  id: string;
  lesson_at: string;
  fee_pence: number;
  student_id: string;
  status: "planned" | "completed" | "cancelled" | null;
  student: { student_name: string } | { student_name: string }[] | null;
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
  student: { student_name: string } | { student_name: string }[] | null;
};

type ChartLessonRow = {
  id: string;
  lesson_at: string;
  fee_pence: number;
  status: "planned" | "completed" | "cancelled" | null;
};

type DashboardPaymentRow = PaymentLike & {
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
  return Array.isArray(payment) ? payment[0] ?? null : payment ?? null;
}

function getRangeFromSearchParam(range: string | undefined): ChartRange {
  if (range === "3m" || range === "6m" || range === "12m" || range === "all") {
    return range;
  }

  return "6m";
}

function getMonthStarts(now: Date, months: number) {
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    return date;
  });
}

function getMonthSeriesBetween(startInclusive: Date, endInclusive: Date) {
  const start = new Date(Date.UTC(startInclusive.getUTCFullYear(), startInclusive.getUTCMonth(), 1));
  const end = new Date(Date.UTC(endInclusive.getUTCFullYear(), endInclusive.getUTCMonth(), 1));
  const months: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

function getStudentName(
  student: { student_name: string } | { student_name: string }[] | null | undefined,
) {
  if (!student) {
    return null;
  }

  if (Array.isArray(student)) {
    return student[0]?.student_name ?? null;
  }

  return student.student_name ?? null;
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
  const selectedRange = getRangeFromSearchParam(range);
  const supabase = await createSupabaseServerClient();
  const currencyCode = await getUserCurrencyCode(supabase);

  const now = new Date();
  const currentMonthKey = getMonthKeyLocal(now);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const monthCount = selectedRange === "3m" ? 3 : selectedRange === "12m" ? 12 : 6;
  const fixedMonthStarts = selectedRange === "all" ? [] : getMonthStarts(now, monthCount);
  const fixedRangeStart = fixedMonthStarts[0] ?? monthStart;
  const chartLessonsQuery = supabase
    .from("lessons")
    .select("id, lesson_at, fee_pence, status")
    .or("status.eq.completed,status.is.null")
    .lt("lesson_at", monthEnd.toISOString());

  const [
    activeStudentsResult,
    chartLessonsResult,
    oldestLessonResult,
    recentLessonsResult,
    upcomingLessonsResult,
    paymentsResult,
    paymentAllocationsResult,
    derivedLessonsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, student_name, archived_at"),
    selectedRange === "all"
      ? chartLessonsQuery
      : chartLessonsQuery.gte("lesson_at", fixedRangeStart.toISOString()),
    supabase
      .from("lessons")
      .select("lesson_at")
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("id, student_id, lesson_at, status, fee_pence, topics, went_well, parent_note, improve, homework, effort, confidence, student:students!lessons_student_id_fkey(student_name)")
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(3),
    supabase
      .from("lessons")
      .select("id, student_id, lesson_at, status, fee_pence, student:students!lessons_student_id_fkey(student_name)")
      .eq("status", "planned")
      .order("lesson_at", { ascending: true })
      .limit(3),
    supabase
      .from("payments")
      .select("id, amount_pence, payment_date, source, note, created_at"),
    supabase
      .from("payment_allocations")
      .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)"),
    supabase
      .from("lessons")
      .select(
        "id, lesson_at, fee_pence, student_id, status, student:students!lessons_student_id_fkey(student_name)",
      )
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false }),
  ]);
  const dashboardStudents = ((activeStudentsResult.data ?? []) as DashboardStudentRow[]).map(
    (student) => ({
      id: student.id,
      studentName: student.student_name,
      archivedAt: student.archived_at,
    }),
  );
  const oldestLessonAt = oldestLessonResult.data?.lesson_at
    ? new Date(oldestLessonResult.data.lesson_at)
    : null;
  const hasAnyLessons = Boolean(oldestLessonAt || (upcomingLessonsResult.data ?? []).length > 0);
  const dashboardExperience = deriveDashboardExperience(dashboardStudents, hasAnyLessons);
  const dashboardActions = getDashboardActions(
    dashboardExperience.state,
    dashboardExperience.activeStudents,
  );
  const activeStudentsCount = dashboardExperience.activeStudents.length;
  const recentLessons = ((recentLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter((lesson) =>
    isCompletedLessonStatus(lesson.status),
  );
  const upcomingLessons = ((upcomingLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter(
    (lesson) => lesson.status === "planned",
  );
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
  const paidLessonsCount = derivedLessons.filter(
    (lesson) => calculateLessonPaymentStatus(lesson, paymentAllocations) === "paid",
  ).length;
  const unpaidLessonsCount = derivedLessons.filter(
    (lesson) => lesson.fee_pence - getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations) > 0,
  ).length;
  const receivedThisMonthPence = payments
    .filter((payment) => {
      return getMonthKeyLocal(payment.payment_date ?? payment.created_at) === currentMonthKey;
    })
    .reduce((sum, payment) => sum + payment.amount_pence, 0);

  const monthStarts =
    selectedRange === "all"
      ? oldestLessonAt
        ? getMonthSeriesBetween(oldestLessonAt, now)
        : []
      : fixedMonthStarts;

  const filteredChartLessons = (chartLessonsResult.data ?? []) as ChartLessonRow[];

  const chartMap = new Map<string, number>();
  monthStarts.forEach((start) => {
    const key = getMonthKeyLocal(start);
    chartMap.set(key, 0);
  });

  filteredChartLessons
    .forEach((lesson) => {
    const key = getMonthKeyLocal(lesson.lesson_at);

    if (chartMap.has(key)) {
      chartMap.set(key, (chartMap.get(key) ?? 0) + getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations));
    }
  });

  const monthlyChartData = monthStarts.map((start) => {
    const key = getMonthKeyLocal(start);
    return {
      month: formatMonthShortLocal(start),
      amountPence: chartMap.get(key) ?? 0,
    };
  });
  const selectedRangeEarningsPence = filteredChartLessons
    .reduce(
    (sum, lesson) => sum + getPaidAllocatedAmountForLesson(lesson.id, paymentAllocations),
    0,
  );
  const rangeLabel =
    selectedRange === "3m"
      ? "Last 3 months"
      : selectedRange === "12m"
        ? "Last 12 months"
        : selectedRange === "all"
          ? "All time"
          : "Last 6 months";

  return (
    <section>
      <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600">Overview of payments and recent unpaid lessons.</p>

      {!activeStudentsResult.error &&
      !chartLessonsResult.error &&
      !oldestLessonResult.error &&
      !upcomingLessonsResult.error &&
      !paymentsResult.error &&
      !paymentAllocationsResult.error &&
      !derivedLessonsResult.error ? (
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
              <Link href={dashboardActions[0].href} className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto">{dashboardActions[0].label}</Link>
              <Link href={dashboardActions[1].href} className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto">{dashboardActions[1].label}</Link>
              <Link href={dashboardActions[2].href} className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto">{dashboardActions[2].label}</Link>
            </div>
          </nav>
        )
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Active students</p>
          <p className="mt-1.5 text-2xl font-semibold text-blue-900 sm:mt-2">{activeStudentsCount}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Received this month</p>
          <p className="mt-1.5 text-2xl font-semibold text-emerald-900 sm:mt-2">
            {formatCurrencyFromMinorUnits(receivedThisMonthPence, currencyCode)}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid total</p>
          <p className="mt-1.5 text-2xl font-semibold text-amber-900 sm:mt-2">
            {formatCurrencyFromMinorUnits(unpaidTotalPence, currencyCode)}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid lessons</p>
          <p className="mt-1.5 text-2xl font-semibold text-amber-900 sm:mt-2">{unpaidLessonsCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Recent lessons</h2>
          <p className="mt-1 text-sm text-zinc-600">The latest lessons you&apos;ve logged.</p>

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
                        <span className="text-sm text-zinc-600">{formatDateTimeLocal(lesson.lesson_at)}</span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                        >
                          {getPaymentStatusLabel(paymentStatus)}
                        </span>
                      </div>
                    );
                  })()}
                  {lesson.topics ? (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                      {cleanLessonText(lesson.topics)}
                    </p>
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
                        message={formatParentUpdate(getStudentName(lesson.student)!, {
                          lessonAt: lesson.lesson_at,
                          topics: lesson.topics ?? "",
                          wentWell: lesson.went_well ?? "",
                          parentNote: lesson.parent_note ?? "",
                          improve: lesson.improve ?? "",
                          homework: lesson.homework ?? "",
                          effort: lesson.effort,
                          confidence: lesson.confidence,
                        })}
                      />
                  ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Upcoming lessons</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Your scheduled lessons. Open one when you’re ready to complete it after the session.
          </p>

          {upcomingLessonsResult.error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              Could not load upcoming lessons.
            </p>
          ) : upcomingLessons.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              No scheduled lessons yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <Link
                    href={`/app/students/${lesson.student_id}/lessons/${lesson.id}`}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {(() => {
                      const paymentStatus = calculateLessonPaymentStatus(lesson, paymentAllocations);

                      return (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-zinc-900">
                              {getStudentName(lesson.student) ?? "Unknown student"}
                            </p>
                            <span className="text-sm text-zinc-600">{formatDateTimeLocal(lesson.lesson_at)}</span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getLessonStatusClassName(lesson.status)}`}
                            >
                              {getLessonStatusLabel(lesson.status)}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                            >
                              {getPaymentStatusLabel(paymentStatus)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </Link>
                  <div className="mt-2">
                    <Link
                      href={`/app/students/${lesson.student_id}/lessons/${lesson.id}?mode=complete`}
                      className="inline-flex min-h-9 items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      Complete lesson
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-900">Earnings over time</h2>
              <p className="mt-1 text-sm text-zinc-600">{rangeLabel}</p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {formatCurrencyFromMinorUnits(selectedRangeEarningsPence, currencyCode)}
              </p>
            </div>
            <ChartRangeFilter selected={selectedRange} />
          </div>
          {!hasAnyLessons &&
          !activeStudentsResult.error &&
          !chartLessonsResult.error &&
          !oldestLessonResult.error &&
          !paymentsResult.error &&
          !paymentAllocationsResult.error &&
          !derivedLessonsResult.error ? (
            <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-900">No lesson insights yet.</p>
              <p className="mt-2 text-sm text-zinc-600">
                Once you start logging lessons, your earnings and payment insights will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-3 sm:mt-4">
              <MonthlyEarningsChart data={monthlyChartData} currencyCode={currencyCode} />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Paid vs unpaid</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Paid lessons</p>
              <p className="mt-1 text-xl font-semibold text-emerald-900">{paidLessonsCount}</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid lessons</p>
              <p className="mt-1 text-xl font-semibold text-amber-900">{unpaidLessonsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Unpaid lessons</h2>

        {activeStudentsResult.error ||
        chartLessonsResult.error ||
        oldestLessonResult.error ||
        paymentsResult.error ||
        paymentAllocationsResult.error ||
        derivedLessonsResult.error ? (
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
                Log your first lesson and we&apos;ll start showing payment tracking, recent activity, and earnings insights here.
              </p>
            </div>
          )
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
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
                        {formatDateTimeLocal(lesson.lesson_at)}
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
        )}
      </div>
    </section>
  );
}
