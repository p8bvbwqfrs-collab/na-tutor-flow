import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewLessonForm } from "../../new-lesson/new-lesson-form";
import { ScheduleLessonForm } from "../../schedule-lesson/schedule-lesson-form";

type EditLessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function EditLessonPage({ params, searchParams }: EditLessonPageProps) {
  const { id, lessonId } = await params;
  const { mode } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error: studentError }, { data: lesson, error: lessonError }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, student_name")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("lessons")
        .select("id, student_id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, effort, confidence, fee_pence, paid, status")
        .eq("id", lessonId)
        .eq("student_id", id)
        .maybeSingle(),
    ]);

  if (studentError || lessonError || !student || !lesson) {
    notFound();
  }

  const lessonStatus = lesson.status ?? "completed";
  const isPlannedLesson = lessonStatus === "planned";
  const isCompletingPlannedLesson = isPlannedLesson && mode === "complete";
  const plannedTopics = lesson.topics === "Planned lesson" ? "" : lesson.topics;

  return (
    <section className="max-w-3xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {isCompletingPlannedLesson
              ? "Complete lesson"
              : isPlannedLesson
                ? "Edit scheduled lesson"
                : "Edit lesson"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {student.student_name}
            {isPlannedLesson && !isCompletingPlannedLesson ? " · Planned lesson" : ""}
          </p>
        </div>
        <Link
          href={`/app/students/${student.id}`}
          className="inline-flex w-fit rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Back to student
        </Link>
      </div>

      {isPlannedLesson && !isCompletingPlannedLesson ? (
        <ScheduleLessonForm
          mode="edit"
          lessonId={lesson.id}
          studentId={student.id}
          studentName={student.student_name}
          initialLesson={{
            lessonAt: lesson.lesson_at,
            topics: plannedTopics,
          }}
        />
      ) : (
        <NewLessonForm
          mode="edit"
          lessonId={lesson.id}
          studentId={student.id}
          studentName={student.student_name}
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
            feeGbp: (lesson.fee_pence / 100).toFixed(2),
            paid: lesson.paid,
          }}
        />
      )}
    </section>
  );
}
