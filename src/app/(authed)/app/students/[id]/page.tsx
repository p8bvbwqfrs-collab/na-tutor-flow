import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LessonPaidToggle } from "./components/lesson-paid-toggle";
import { MonthlySummaryGenerator } from "./components/monthly-summary-generator";
import { ProgressSignalCard } from "./components/progress-signal-card";
import { StudentArchiveToggle } from "./components/student-archive-toggle";
import { StudentTrendChart } from "./components/student-trend-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StudentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonUpdated?: string }>;
};

type Lesson = {
  id: string;
  lesson_at: string;
  topics: string;
  topic_tags: string[] | null;
  went_well: string | null;
  improve: string | null;
  homework: string | null;
  fee_pence: number;
  paid: boolean;
  confidence: number;
  effort: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const lessonDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const lessonTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function cleanLessonText(value: string) {
  return value
    .split(/\n|;/)
    .map((part) => part.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function findLatestNonEmptyValue<T>(lessons: Lesson[], getValue: (lesson: Lesson) => T | null) {
  for (const lesson of lessons) {
    const value = getValue(lesson);

    if (typeof value === "string") {
      if (value.trim()) {
        return value.trim();
      }
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return value;
      }
      continue;
    }

    if (value) {
      return value;
    }
  }

  return null;
}

export default async function StudentDetailPage({ params, searchParams }: StudentPageProps) {
  noStore();

  const { id } = await params;
  const { lessonUpdated } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const studentQuery = supabase
    .from("students")
    .select(
      "id, student_name, parent_name, parent_contact, parent_email, notes, created_at, archived_at",
    )
    .eq("id", id)
    .maybeSingle();

  const lessonsQuery = () =>
    supabase
      .from("lessons")
      .select(
        "id, lesson_at, topics, topic_tags, went_well, improve, homework, fee_pence, paid, confidence, effort",
      )
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const fallbackLessonsQuery = () =>
    supabase
      .from("lessons")
      .select("id, lesson_at, topics, went_well, improve, homework, fee_pence, paid, confidence, effort")
      .eq("student_id", id)
      .order("lesson_at", { ascending: false });

  const [{ data: student, error: studentError }, initialLessonsResult] = await Promise.all([
    studentQuery,
    lessonsQuery(),
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
  const isArchived = Boolean(student.archived_at);
  const totalLessons = lessons.length;
  const outstandingAmountPence = lessons
    .filter((lesson) => !lesson.paid)
    .reduce((sum, lesson) => sum + lesson.fee_pence, 0);
  const latestLessonDate =
    totalLessons > 0 ? dateFormatter.format(new Date(lessons[0].lesson_at)) : "No lessons yet";
  const avgConfidence =
    totalLessons > 0
      ? (lessons.reduce((sum, lesson) => sum + lesson.confidence, 0) / totalLessons).toFixed(1)
      : "-";
  const avgEffort =
    totalLessons > 0 ? (lessons.reduce((sum, lesson) => sum + lesson.effort, 0) / totalLessons).toFixed(1) : "-";
  const latestConfidenceLessons = lessons.slice(0, 3);
  const previousConfidenceLessons = lessons.slice(3, 6);
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

  const chronologicalLessons = [...lessons].reverse();
  const confidenceTrendPoints = chronologicalLessons.map((lesson) => ({
    label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(
      new Date(lesson.lesson_at),
    ),
    value: lesson.confidence,
  }));
  const effortTrendPoints = chronologicalLessons.map((lesson) => ({
    label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(
      new Date(lesson.lesson_at),
    ),
    value: lesson.effort,
  }));
  const nextFocusPrep = findLatestNonEmptyValue(lessons, (lesson) => lesson.improve);
  const homeworkPrep = findLatestNonEmptyValue(lessons, (lesson) => lesson.homework);
  const recentTopicTags = findLatestNonEmptyValue(lessons, (lesson) => lesson.topic_tags);
  const recentTopicText = findLatestNonEmptyValue(lessons, (lesson) => lesson.topics);
  const recentTopicPrep = Array.isArray(recentTopicTags)
    ? recentTopicTags.join(", ")
    : recentTopicText;

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
          href={`/app/students/${student.id}/edit`}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Edit
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
            {currencyFormatter.format(outstandingAmountPence / 100)}
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

      <div className="mt-6 space-y-6">
        <section>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-medium text-zinc-900">Next lesson prep</h2>
            <p className="mt-1 text-sm text-zinc-600">What to pick up next time, based on recent lessons.</p>
            {lessons.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Next session reminder</p>
                  <p className="mt-2 text-sm text-zinc-900">{nextFocusPrep || "No next focus captured yet."}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Homework to review</p>
                  <p className="mt-2 text-sm text-zinc-900">
                    {homeworkPrep || "No homework or follow-up noted yet."}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Recent topic</p>
                  <p className="mt-2 text-sm text-zinc-900">{recentTopicPrep || "No recent topic captured yet."}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">No prep notes yet.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Once you log a lesson, the latest area to improve, homework, and recent topics will show here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <MonthlySummaryGenerator studentName={student.student_name} lessons={lessons} />
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

        <section>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-medium text-zinc-900">Past lessons</h2>
            {lessonsError ? (
              <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                Could not load lessons.
              </p>
            ) : lessons.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">No lessons yet.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Log your first lesson to track progress, generate updates, and manage payments.
                </p>
                <Link
                  href={`/app/students/${student.id}/new-lesson`}
                  className="mt-3 inline-flex rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Log first lesson
                </Link>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-100 text-zinc-700">
                    <tr>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Topics</th>
                      <th className="px-3 py-2 font-medium">Fee</th>
                      <th className="px-3 py-2 font-medium">Paid</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((lesson) => (
                      <tr key={lesson.id} className="border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50">
                        <td className="whitespace-nowrap px-3 py-3 align-top text-zinc-900">
                          <Link
                            href={`/app/students/${student.id}/lessons/${lesson.id}`}
                            className="block underline-offset-4 hover:underline"
                          >
                            <span className="block font-medium text-zinc-900">
                              {lessonDateFormatter.format(new Date(lesson.lesson_at))}
                            </span>
                            <span className="mt-1 block text-xs text-zinc-600">
                              {lessonTimeFormatter.format(new Date(lesson.lesson_at))}
                            </span>
                          </Link>
                        </td>
                        <td className="max-w-sm px-3 py-3 align-top text-zinc-900" title={lesson.topics}>
                          <Link
                            href={`/app/students/${student.id}/lessons/${lesson.id}`}
                            className="block underline-offset-4 hover:underline"
                          >
                            <span className="block font-medium text-zinc-900">
                              {cleanLessonText(lesson.topics)}
                            </span>
                            {lesson.topic_tags && lesson.topic_tags.length > 0 ? (
                              <span className="mt-2 flex flex-wrap gap-1.5">
                                {lesson.topic_tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            ) : null}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-zinc-900">
                          <Link
                            href={`/app/students/${student.id}/lessons/${lesson.id}`}
                            className="block text-zinc-900 underline-offset-4 hover:underline"
                          >
                            {currencyFormatter.format(lesson.fee_pence / 100)}
                          </Link>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <Link href={`/app/students/${student.id}/lessons/${lesson.id}`} className="block">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                lesson.paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {lesson.paid ? "Paid" : "Unpaid"}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/app/students/${student.id}/lessons/${lesson.id}`}
                              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
                            >
                              Edit
                            </Link>
                            <LessonPaidToggle lessonId={lesson.id} initialPaid={lesson.paid} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
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
