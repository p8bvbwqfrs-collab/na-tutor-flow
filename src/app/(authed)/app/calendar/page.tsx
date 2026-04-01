import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

const CALENDAR_TIME_ZONE = "Europe/London";

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: CALENDAR_TIME_ZONE,
});
const monthHeadingFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});
const dayNumberFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: CALENDAR_TIME_ZONE,
});
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: CALENDAR_TIME_ZONE,
});
const monthKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  timeZone: CALENDAR_TIME_ZONE,
});

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

function formatDateKey(date: Date) {
  return dateKeyFormatter.format(date);
}

function formatMonthKey(date: Date) {
  return monthKeyFormatter.format(date);
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
  const todayKey = formatDateKey(now);
  const currentMonthKey = formatMonthKey(now);
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
  const lessonsByDate = new Map<string, CalendarLessonRow[]>();

  lessons.forEach((lesson) => {
    const key = formatDateKey(new Date(lesson.lesson_at));
    const bucket = lessonsByDate.get(key) ?? [];
    bucket.push(lesson);
    lessonsByDate.set(key, bucket);
  });

  const monthCells = getMonthGrid(monthStart);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(Date.UTC(2026, 2, index + 2))),
  );

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
              {monthHeadingFormatter.format(monthStart)}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Lessons are shown by the date and time saved on each lesson.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/app/calendar?month=${prevMonthStart.toISOString().slice(0, 7)}`}
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
              href={`/app/calendar?month=${nextMonthStart.toISOString().slice(0, 7)}`}
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
            <div className="mt-4 grid grid-cols-7 gap-2 text-center">
              {weekdayLabels.map((label) => (
                <div key={label} className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthCells.map(({ date, inMonth }) => {
                const key = formatDateKey(date);
                const dayLessons = lessonsByDate.get(key) ?? [];
                const isToday = key === todayKey;

                return (
                  <div
                    key={key}
                    className={`min-h-24 rounded-lg border p-2 sm:min-h-28 ${
                      isToday
                        ? "border-zinc-400 bg-zinc-100"
                        : inMonth
                          ? "border-zinc-200 bg-zinc-50"
                          : "border-zinc-100 bg-white text-zinc-400"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        isToday
                          ? "text-zinc-900"
                          : inMonth
                            ? "text-zinc-700"
                            : "text-zinc-400"
                      }`}
                    >
                      {dayNumberFormatter.format(date)}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {dayLessons.slice(0, 2).map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/app/students/${lesson.student_id}/lessons/${lesson.id}`}
                          className={`block rounded-md border px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                            lesson.status === "planned"
                              ? "border-sky-100 bg-sky-50/70 hover:border-sky-200 hover:bg-sky-50"
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <p
                            className={`truncate text-xs font-medium ${
                              lesson.status === "planned" ? "text-sky-900" : "text-zinc-900"
                            }`}
                          >
                            {getStudentName(lesson.student)}
                          </p>
                          <p
                            className={`mt-0.5 text-xs ${
                              lesson.status === "planned" ? "text-sky-800" : "text-zinc-600"
                            }`}
                          >
                            {timeFormatter.format(new Date(lesson.lesson_at))}
                          </p>
                          {lesson.status === "planned" ? (
                            <p className="mt-0.5 text-xs text-sky-700">
                              {lesson.topics && lesson.topics !== "Planned lesson" ? lesson.topics : "Planned lesson"}
                            </p>
                          ) : null}
                        </Link>
                      ))}
                      {dayLessons.length > 2 ? (
                        <p className="px-1 text-xs text-zinc-500">
                          +{dayLessons.length - 2} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

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
