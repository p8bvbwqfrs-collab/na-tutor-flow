import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditStudentForm } from "./student-edit-form";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("id, student_name, parent_name, parent_contact, parent_email, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !student) {
    notFound();
  }

  return (
    <section className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-zinc-900">Edit student</h1>
        <p className="mt-1 text-sm text-zinc-600">Update student and parent details.</p>
      </div>

      <EditStudentForm
        studentId={student.id}
        initialStudentName={student.student_name}
        initialParentName={student.parent_name ?? ""}
        initialParentContact={student.parent_contact ?? student.parent_email ?? ""}
        initialNotes={student.notes ?? ""}
      />

      <div className="mt-4">
        <Link href={`/app/students/${student.id}`} className="text-sm text-zinc-600 hover:text-zinc-900">
          Back to student
        </Link>
      </div>
    </section>
  );
}
