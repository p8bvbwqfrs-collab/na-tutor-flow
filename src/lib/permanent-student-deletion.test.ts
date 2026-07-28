import assert from "node:assert/strict";
import test from "node:test";
import {
  PERMANENT_STUDENT_DELETION_SUCCESS_PATH,
  submitPermanentStudentDeletion,
} from "./permanent-student-deletion";

test("successful deletion navigates to the archived list with its success query state", async () => {
  const destinations: string[] = [];
  const inFlight = { current: false };

  const result = await submitPermanentStudentDeletion({
    inFlight,
    deleteStudent: async () => ({ ok: true }),
    navigate: (path) => destinations.push(path),
  });

  assert.deepEqual(result, { status: "success" });
  assert.deepEqual(destinations, ["/app/students?view=archived&deleted=1"]);
  assert.equal(PERMANENT_STUDENT_DELETION_SUCCESS_PATH.includes("deleted=1"), true);
});

test("failed deletion remains on the detail page and returns a visible error", async () => {
  const destinations: string[] = [];
  const inFlight = { current: false };

  const result = await submitPermanentStudentDeletion({
    inFlight,
    deleteStudent: async () => ({
      ok: false,
      error: "The student could not be deleted. Please try again.",
    }),
    navigate: (path) => destinations.push(path),
  });

  assert.deepEqual(result, {
    status: "error",
    error: "The student could not be deleted. Please try again.",
  });
  assert.deepEqual(destinations, []);
  assert.equal(inFlight.current, false);
});

test("repeated activation cannot issue duplicate deletions", async () => {
  let finishDeletion: ((result: { ok: true }) => void) | undefined;
  let deletionCount = 0;
  const inFlight = { current: false };
  const destinations: string[] = [];
  const pendingDeletion = new Promise<{ ok: true }>((resolve) => {
    finishDeletion = resolve;
  });
  const submission = {
    inFlight,
    deleteStudent: async () => {
      deletionCount += 1;
      return pendingDeletion;
    },
    navigate: (path: string) => destinations.push(path),
  };

  const first = submitPermanentStudentDeletion(submission);
  const repeated = await submitPermanentStudentDeletion(submission);

  assert.deepEqual(repeated, { status: "duplicate" });
  assert.equal(deletionCount, 1);

  finishDeletion?.({ ok: true });
  assert.deepEqual(await first, { status: "success" });
  assert.deepEqual(destinations, [PERMANENT_STUDENT_DELETION_SUCCESS_PATH]);
});
