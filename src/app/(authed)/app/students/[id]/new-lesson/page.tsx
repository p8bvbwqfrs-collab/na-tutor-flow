import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewLessonForm } from "./new-lesson-form";

type NewLessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error }, { data: recentLesson }] = await Promise.all([
    supabase
      .from("students")
      .select("id, student_name")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("fee_pence")
      .eq("student_id", id)
      .order("lesson_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (error || !student) {
    notFound();
  }

  const initialFeeGbp =
    typeof recentLesson?.fee_pence === "number"
      ? (recentLesson.fee_pence / 100).toFixed(2)
      : "0.00";

  return (
    <section className="max-w-3xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Log lesson</h1>
          <p className="mt-1 text-sm text-zinc-600">{student.student_name}</p>
        </div>
        <Link
          href={`/app/students/${student.id}`}
          className="inline-flex w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Back to student
        </Link>
      </div>

      <NewLessonForm
        studentId={student.id}
        studentName={student.student_name}
        initialLesson={{
          lessonAt: new Date().toISOString(),
          topics: "",
          topicTags: [],
          wentWell: "",
          improve: "",
          homework: "",
          effort: 3,
          confidence: 3,
          feeGbp: initialFeeGbp,
          paid: false,
        }}
      />
    </section>
  );
}
