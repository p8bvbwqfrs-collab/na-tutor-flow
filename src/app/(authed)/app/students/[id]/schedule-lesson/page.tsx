import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ScheduleLessonForm } from "./schedule-lesson-form";

type ScheduleLessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScheduleLessonPage({ params }: ScheduleLessonPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("id, student_name")
    .eq("id", id)
    .maybeSingle();

  if (error || !student) {
    notFound();
  }

  return (
    <section className="max-w-3xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Schedule lesson</h1>
          <p className="mt-1 text-sm text-zinc-600">{student.student_name}</p>
        </div>
        <Link
          href={`/app/students/${student.id}`}
          className="inline-flex w-fit rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Back to student
        </Link>
      </div>

      <ScheduleLessonForm studentId={student.id} studentName={student.student_name} />
    </section>
  );
}
