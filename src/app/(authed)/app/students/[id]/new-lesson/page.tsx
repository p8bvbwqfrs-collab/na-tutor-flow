import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { LessonPageHeader } from "../components/lesson-page-header";
import { NewLessonForm } from "./new-lesson-form";

type NewLessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: student, error }, { data: recentLesson }, currencyCode] = await Promise.all([
    supabase
      .from("students")
      .select("id, student_name")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("fee_pence")
      .eq("student_id", id)
      .or("status.eq.completed,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getUserCurrencyCode(supabase),
  ]);

  if (error || !student) {
    notFound();
  }

  const initialFeeAmount =
    typeof recentLesson?.fee_pence === "number"
      ? (recentLesson.fee_pence / 100).toFixed(2)
      : "0.00";

  return (
    <section className="w-full min-w-0 max-w-3xl">
      <LessonPageHeader
        studentName={student.student_name}
        pageLabel="Log lesson"
        backHref={`/app/students/${student.id}`}
      />

      <NewLessonForm
        studentId={student.id}
        studentName={student.student_name}
        currencyCode={currencyCode}
        initialLesson={{
          lessonAt: new Date().toISOString(),
          topics: "",
          topicTags: [],
          wentWell: "",
          parentNote: "",
          improve: "",
          homework: "",
          effort: 3,
          confidence: 3,
          feeAmount: initialFeeAmount,
          paid: false,
        }}
      />
    </section>
  );
}
