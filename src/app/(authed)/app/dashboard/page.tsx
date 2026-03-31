import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MarkPaidButton } from "./components/mark-paid-button";
import { MonthlyEarningsChart } from "./components/monthly-earnings-chart";
import { ChartRangeFilter, type ChartRange } from "./components/chart-range-filter";

type LessonRow = {
  id: string;
  lesson_at: string;
  fee_pence: number;
  paid: boolean;
  student_id: string;
  status: "planned" | "completed" | "cancelled" | null;
  student: { student_name: string } | { student_name: string }[] | null;
};

type DashboardLessonOverviewRow = {
  id: string;
  student_id: string;
  lesson_at: string;
  status: "planned" | "completed" | "cancelled" | null;
  student: { student_name: string } | { student_name: string }[] | null;
};

type ChartLessonRow = {
  lesson_at: string;
  fee_pence: number;
  status: "planned" | "completed" | "cancelled" | null;
};

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const monthShortFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

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

type DashboardPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { range } = await searchParams;
  const selectedRange = getRangeFromSearchParam(range);
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const monthCount = selectedRange === "3m" ? 3 : selectedRange === "12m" ? 12 : 6;
  const fixedMonthStarts = selectedRange === "all" ? [] : getMonthStarts(now, monthCount);
  const fixedRangeStart = fixedMonthStarts[0] ?? monthStart;
  const chartLessonsQuery = supabase
    .from("lessons")
    .select("lesson_at, fee_pence, status")
    .or("status.eq.completed,status.is.null")
    .lt("lesson_at", monthEnd.toISOString());

  const [
    activeStudentsResult,
    unpaidTotalsResult,
    monthTotalsResult,
    unpaidLessonsResult,
    unpaidLessonsCountResult,
    paidLessonsCountResult,
    chartLessonsResult,
    oldestLessonResult,
    recentLessonsResult,
    upcomingLessonsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null),
    supabase
      .from("lessons")
      .select("fee_pence")
      .eq("paid", false)
      .or("status.eq.completed,status.is.null"),
    supabase
      .from("lessons")
      .select("fee_pence")
      .or("status.eq.completed,status.is.null")
      .gte("lesson_at", monthStart.toISOString())
      .lt("lesson_at", monthEnd.toISOString()),
    supabase
      .from("lessons")
      .select(
        "id, lesson_at, fee_pence, paid, student_id, status, student:students!lessons_student_id_fkey(student_name)",
      )
      .eq("paid", false)
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(20),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("paid", false)
      .or("status.eq.completed,status.is.null"),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("paid", true)
      .or("status.eq.completed,status.is.null"),
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
      .select("id, student_id, lesson_at, status, student:students!lessons_student_id_fkey(student_name)")
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(3),
    supabase
      .from("lessons")
      .select("id, student_id, lesson_at, status, student:students!lessons_student_id_fkey(student_name)")
      .eq("status", "planned")
      .order("lesson_at", { ascending: true })
      .limit(3),
  ]);

  const unpaidTotalPence = (unpaidTotalsResult.data ?? []).reduce(
    (sum, row) => sum + row.fee_pence,
    0,
  );

  const monthEarningsPence = (monthTotalsResult.data ?? []).reduce(
    (sum, row) => sum + row.fee_pence,
    0,
  );

  const unpaidLessons = (unpaidLessonsResult.data ?? []) as LessonRow[];
  const activeStudentsCount = activeStudentsResult.count ?? 0;
  const unpaidLessonsCount = unpaidLessonsCountResult.count ?? 0;
  const paidLessonsCount = paidLessonsCountResult.count ?? 0;
  const oldestLessonAt = oldestLessonResult.data?.lesson_at
    ? new Date(oldestLessonResult.data.lesson_at)
    : null;
  const hasAnyLessons = Boolean(oldestLessonAt);
  const showDashboardOnboarding = activeStudentsCount === 0 && !hasAnyLessons;
  const recentLessons = ((recentLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter((lesson) =>
    isCompletedLessonStatus(lesson.status),
  );
  const upcomingLessons = ((upcomingLessonsResult.data ?? []) as DashboardLessonOverviewRow[]).filter(
    (lesson) => lesson.status === "planned",
  );

  const monthStarts =
    selectedRange === "all"
      ? oldestLessonAt
        ? getMonthSeriesBetween(oldestLessonAt, now)
        : []
      : fixedMonthStarts;

  const filteredChartLessons = (chartLessonsResult.data ?? []) as ChartLessonRow[];

  const chartMap = new Map<string, number>();
  monthStarts.forEach((start) => {
    const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
    chartMap.set(key, 0);
  });

  filteredChartLessons.forEach((lesson) => {
    const date = new Date(lesson.lesson_at);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    if (chartMap.has(key)) {
      chartMap.set(key, (chartMap.get(key) ?? 0) + lesson.fee_pence);
    }
  });

  const monthlyChartData = monthStarts.map((start) => {
    const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      month: monthShortFormatter.format(start),
      amountPence: chartMap.get(key) ?? 0,
    };
  });
  const selectedRangeEarningsPence = filteredChartLessons.reduce(
    (sum, lesson) => sum + lesson.fee_pence,
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

      {showDashboardOnboarding &&
      !activeStudentsResult.error &&
      !unpaidTotalsResult.error &&
      !monthTotalsResult.error &&
      !unpaidLessonsResult.error &&
      !unpaidLessonsCountResult.error &&
      !paidLessonsCountResult.error &&
      !chartLessonsResult.error &&
      !oldestLessonResult.error ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-lg font-medium text-zinc-900">Get started by adding your first student</p>
          <p className="mt-2 text-sm text-zinc-600">
            Start with one student and one lesson, and the rest of the workflow will fall into place.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>1. Add your first student</li>
            <li>2. Log your first lesson</li>
            <li>3. Copy an update for the parent</li>
          </ol>
          <Link
            href="/app/students/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Add student
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Active students</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{activeStudentsCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">This month earned</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {currencyFormatter.format(monthEarningsPence / 100)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid total</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {currencyFormatter.format(unpaidTotalPence / 100)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid lessons</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{unpaidLessonsCount}</p>
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
                <Link
                  key={lesson.id}
                  href={`/app/students/${lesson.student_id}/lessons/${lesson.id}`}
                  className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {getStudentName(lesson.student) ?? "Unknown student"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {dateFormatter.format(new Date(lesson.lesson_at))}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Upcoming lessons</h2>
          <p className="mt-1 text-sm text-zinc-600">Any lessons already dated in the future.</p>

          {upcomingLessonsResult.error ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              Could not load upcoming lessons.
            </p>
          ) : upcomingLessons.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              No upcoming lessons yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcomingLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/app/students/${lesson.student_id}/lessons/${lesson.id}`}
                  className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {getStudentName(lesson.student) ?? "Unknown student"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {dateFormatter.format(new Date(lesson.lesson_at))}
                  </p>
                </Link>
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
                {currencyFormatter.format(selectedRangeEarningsPence / 100)}
              </p>
            </div>
            <ChartRangeFilter selected={selectedRange} />
          </div>
          {!hasAnyLessons &&
          !activeStudentsResult.error &&
          !unpaidTotalsResult.error &&
          !monthTotalsResult.error &&
          !unpaidLessonsResult.error &&
          !unpaidLessonsCountResult.error &&
          !paidLessonsCountResult.error &&
          !chartLessonsResult.error &&
          !oldestLessonResult.error ? (
            <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-900">No lesson insights yet.</p>
              <p className="mt-2 text-sm text-zinc-600">
                Once you start logging lessons, your earnings and payment insights will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <MonthlyEarningsChart data={monthlyChartData} />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Paid vs unpaid</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Paid lessons</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900">{paidLessonsCount}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Unpaid lessons</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900">{unpaidLessonsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Unpaid lessons</h2>

        {activeStudentsResult.error ||
        unpaidTotalsResult.error ||
        monthTotalsResult.error ||
        unpaidLessonsResult.error ||
        unpaidLessonsCountResult.error ||
        paidLessonsCountResult.error ||
        chartLessonsResult.error ||
        oldestLessonResult.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          >
            Could not load dashboard data.
          </p>
        ) : unpaidLessons.length === 0 ? (
          hasAnyLessons ? (
            <p className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
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
                  <th className="px-3 py-2 font-medium">Student</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Fee</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidLessons.map((lesson, index) => (
                  <tr
                    key={lesson.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-50"} border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50`}
                  >
                    <td className="px-3 py-3 text-zinc-900">
                      {getStudentName(lesson.student) ?? "Unknown student"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-900">
                      {dateFormatter.format(new Date(lesson.lesson_at))}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-900">
                      {currencyFormatter.format(lesson.fee_pence / 100)}
                    </td>
                    <td className="px-3 py-3">
                      <MarkPaidButton lessonId={lesson.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
