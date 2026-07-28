export const PERMANENT_STUDENT_DELETION_SUCCESS_PATH =
  "/app/students?view=archived&deleted=1";

type DeletionResult = { ok: true } | { ok: false; error: string };

type PermanentStudentDeletionSubmission = {
  inFlight: { current: boolean };
  deleteStudent: () => Promise<DeletionResult>;
  navigate: (path: string) => void;
};

export type PermanentStudentDeletionSubmissionResult =
  | { status: "success" }
  | { status: "error"; error: string }
  | { status: "duplicate" };

export async function submitPermanentStudentDeletion({
  inFlight,
  deleteStudent,
  navigate,
}: PermanentStudentDeletionSubmission): Promise<PermanentStudentDeletionSubmissionResult> {
  if (inFlight.current) {
    return { status: "duplicate" };
  }

  inFlight.current = true;

  try {
    const result = await deleteStudent();

    if (!result.ok) {
      inFlight.current = false;
      return { status: "error", error: result.error };
    }

    navigate(PERMANENT_STUDENT_DELETION_SUCCESS_PATH);
    return { status: "success" };
  } catch {
    inFlight.current = false;
    return {
      status: "error",
      error: "The student could not be deleted. Please try again.",
    };
  }
}
