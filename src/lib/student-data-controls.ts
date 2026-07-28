export const ARCHIVED_STUDENT_WRITE_MESSAGE =
  "This student is archived. Restore the student before making changes.";

export type StudentDeletionRecord = {
  id: string;
  user_id: string;
  student_name: string;
  archived_at: string | null;
};

export type StudentDeletionDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  findOwnedStudent: (studentId: string, userId: string) => Promise<StudentDeletionRecord | null>;
  deleteOwnedArchivedStudent: (studentId: string, userId: string, studentName: string) => Promise<{
    deletedId: string | null;
    error: string | null;
  }>;
};

export type DeleteStudentInput = {
  studentId: string;
  confirmationName: string;
};

export async function deleteArchivedStudent(
  dependencies: StudentDeletionDependencies,
  input: DeleteStudentInput,
) {
  const userId = await dependencies.getAuthenticatedUserId();

  if (!userId) {
    return { ok: false as const, error: "You need to be signed in to delete a student." };
  }

  const student = await dependencies.findOwnedStudent(input.studentId, userId);

  if (!student || student.user_id !== userId) {
    return { ok: false as const, error: "This student could not be found." };
  }

  if (!student.archived_at) {
    return {
      ok: false as const,
      error: "Active students cannot be permanently deleted. Archive the student first.",
    };
  }

  if (input.confirmationName !== student.student_name) {
    return {
      ok: false as const,
      error: `Type ${student.student_name} exactly to confirm deletion.`,
    };
  }

  const deletion = await dependencies.deleteOwnedArchivedStudent(
    input.studentId,
    userId,
    input.confirmationName,
  );

  if (deletion.error || deletion.deletedId !== input.studentId) {
    return {
      ok: false as const,
      error: "The student could not be deleted. No success was recorded.",
    };
  }

  return { ok: true as const };
}
