export type SubmissionGuard = {
  acquire: () => string | null;
  release: () => void;
  reset: () => void;
};

export function createSubmissionGuard(
  createId: () => string = () => crypto.randomUUID(),
): SubmissionGuard {
  let inFlight = false;
  let submissionId: string | null = null;

  return {
    acquire() {
      if (inFlight) return null;

      inFlight = true;
      submissionId ??= createId();
      return submissionId;
    },
    release() {
      inFlight = false;
    },
    reset() {
      inFlight = false;
      submissionId = null;
    },
  };
}
