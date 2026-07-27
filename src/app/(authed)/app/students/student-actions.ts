"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteArchivedStudent } from "@/lib/student-data-controls";

export async function verifyStudentIsActive(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "You need to be signed in to make changes." };
  }

  const { data: student, error } = await supabase
    .from("students")
    .select("id, archived_at")
    .eq("id", studentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !student) {
    return { ok: false as const, error: "This student could not be found." };
  }

  if (student.archived_at) {
    return {
      ok: false as const,
      error: "This student is archived. Restore the student before making changes.",
    };
  }

  return { ok: true as const };
}

export async function deleteStudentPermanently(input: {
  studentId: string;
  confirmationName: string;
}) {
  const supabase = await createSupabaseServerClient();

  return deleteArchivedStudent(
    {
      getAuthenticatedUserId: async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        return error ? null : user?.id ?? null;
      },
      findOwnedStudent: async (studentId, userId) => {
        const { data, error } = await supabase
          .from("students")
          .select("id, user_id, student_name, archived_at")
          .eq("id", studentId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Could not verify student before permanent deletion", {
            studentId,
            error,
          });
          return null;
        }

        return data;
      },
      deleteOwnedArchivedStudent: async (studentId, userId, studentName) => {
        const { data, error } = await supabase
          .from("students")
          .delete()
          .eq("id", studentId)
          .eq("user_id", userId)
          .eq("student_name", studentName)
          .not("archived_at", "is", null)
          .select("id")
          .maybeSingle();

        if (error) {
          console.error("Could not permanently delete archived student", {
            studentId,
            error,
          });
        }

        return { deletedId: data?.id ?? null, error: error?.message ?? null };
      },
    },
    input,
  );
}
