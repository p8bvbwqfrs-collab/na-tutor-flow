import Link from "next/link";
import {
  formatDayNumberLocal,
  formatMonthLocal,
  formatWeekdayShortLocal,
  getDateKeyLocal,
  getMonthKeyLocal,
} from "@/lib/datetime";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarGrid } from "./calendar-grid";

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

type CalendarLessonRow = {
  id: string;
  student_id: string;
  lesson_at: string;
  topics: string;
  status: "planned" | "completed" | "cancelled" | null;
  student: { student_name: string } | { student_name: string }[] | null;
};

function getStudentName(
  student: { student_name: string } | { student_name: string }[] | null | undefined,
) {
  if (!student) {
    return "Student";
  }

  if (Array.isArray(student)) {
    return student[0]?.student_name ?? "Student";
  }

  return student.student_name ?? "Student";
}

function parseMonthParam(input: string | undefined) {
  if (!input || !/^\d{4}-\d{2}$/.test(input)) {
    return null;
  }

  const [yearText, monthText] = input.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  return new Date(Date.UTC(year, monthIndex, 1));
}

function getMonthGrid(monthStart: Date) {
  const start = new Date(monthStart);
  const end = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));
  const startOffset = (start.getUTCDay() + 6) % 7;
  const totalDays = end.getUTCDate();
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i - startOffset + 1));
    cells.push({ date, inMonth: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day));
    cells.push({ date, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay: number = cells.length - (startOffset + totalDays) + 1;
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, nextDay));
    cells.push({ date, inMonth: false });
  }

  return cells;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { month } = await searchParams;
  const now = new Date();
  const todayKey = getDateKeyLocal(now);
  const currentMonthKey = getMonthKeyLocal(now);
  const monthStart = parseMonthParam(month) ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
  const prevMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("id, student_id, lesson_at, topics, status, student:students!lessons_student_id_fkey(student_name)")
    .gte("lesson_at", monthStart.toISOString())
    .lt("lesson_at", nextMonthStart.toISOString())
    .order("lesson_at", { ascending: true });

  const lessons = ((data ?? []) as CalendarLessonRow[]).filter((lesson) => lesson.status !== "cancelled");
  const monthCells = getMonthGrid(monthStart);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    formatWeekdayShortLocal(new Date(Date.UTC(2026, 2, index + 2))),
  );
  const calendarLessons = lessons.map((lesson) => ({
    id: lesson.id,
    studentId: lesson.student_id,
    lessonAt: lesson.lesson_at,
    topics: lesson.topics,
    status: lesson.status,
    studentName: getStudentName(lesson.student),
  }));
  const calendarCells = monthCells.map((cell) => ({
    key: getDateKeyLocal(cell.date),
    dateIso: cell.date.toISOString(),
    inMonth: cell.inMonth,
    dayNumber: formatDayNumberLocal(cell.date),
  }));

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Calendar</h1>
          <p className="mt-1 text-sm text-zinc-600">View your lessons over time</p>
        </div>
        <Link
          href="/app/settings"
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Sync calendar
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-zinc-900">
              {formatMonthLocal(monthStart)}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Lessons are shown by the date and time saved on each lesson.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/app/calendar?month=${getMonthKeyLocal(prevMonthStart)}`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Previous
            </Link>
            <Link
              href={`/app/calendar?month=${currentMonthKey}`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Today
            </Link>
            <Link
              href={`/app/calendar?month=${getMonthKeyLocal(nextMonthStart)}`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Next
            </Link>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          >
            Could not load the calendar just now.
          </p>
        ) : (
          <>
            <CalendarGrid
              monthCells={calendarCells}
              weekdayLabels={weekdayLabels}
              lessons={calendarLessons}
              todayKey={todayKey}
            />

            {lessons.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">No lessons in this month yet.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Lessons you log will appear here on the day they took place.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
