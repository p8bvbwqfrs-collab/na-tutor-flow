import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createSubmissionGuard } from "./submission-guard";

const read = (path: string) => readFileSync(path, "utf8");

test("submission guard rejects rapid repeat activation and keeps one retry identity", () => {
  const createdIds = ["first-id", "second-id"];
  const guard = createSubmissionGuard(() => createdIds.shift() ?? "unexpected-id");

  assert.equal(guard.acquire(), "first-id");
  assert.equal(guard.acquire(), null);

  guard.release();
  assert.equal(guard.acquire(), "first-id");

  guard.reset();
  assert.equal(guard.acquire(), "second-id");
});

test("lesson creation paths synchronously guard submission and reuse stable insert ids", () => {
  const completedLessonForm = read(
    "src/app/(authed)/app/students/[id]/new-lesson/new-lesson-form.tsx",
  );
  const scheduledLessonForm = read(
    "src/app/(authed)/app/students/[id]/schedule-lesson/schedule-lesson-form.tsx",
  );

  for (const source of [completedLessonForm, scheduledLessonForm]) {
    assert.match(source, /submissionGuardRef\.current\.acquire\(\)/);
    assert.match(source, /insert\(\{ id: submissionId, \.\.\.payload \}\)/);
  }

  assert.match(completedLessonForm, /id: nextLessonDraftId/);
  assert.match(completedLessonForm, /window\.location\.replace/);
  assert.doesNotMatch(completedLessonForm, /router\.push[\s\S]{0,120}router\.refresh/);
});

test("other record-creation paths use the same duplicate-submit protection", () => {
  const newStudent = read("src/app/(authed)/app/students/new/page.tsx");
  const recordPayment = read(
    "src/app/(authed)/app/students/[id]/components/record-payment-form.tsx",
  );
  const markPaid = read(
    "src/app/(authed)/app/dashboard/components/mark-paid-button.tsx",
  );
  const paidToggle = read(
    "src/app/(authed)/app/students/[id]/components/lesson-paid-toggle.tsx",
  );

  assert.match(newStudent, /id: submissionId/);
  assert.match(recordPayment, /id: submissionId/);
  assert.match(markPaid, /submissionGuardRef\.current\.acquire\(\)/);
  assert.match(paidToggle, /submissionGuardRef\.current\.acquire\(\)/);
  assert.match(recordPayment, /Payment was recorded, but could not be applied/);
});

test("mutation redirects do not compete with an immediate router refresh", () => {
  const redirectingMutations = [
    "src/app/(authed)/app/students/new/page.tsx",
    "src/app/(authed)/app/students/[id]/edit/student-edit-form.tsx",
    "src/app/(authed)/app/students/[id]/components/student-archive-toggle.tsx",
    "src/app/(authed)/app/students/[id]/components/delete-lesson-button.tsx",
  ];

  for (const path of redirectingMutations) {
    const source = read(path);
    assert.match(source, /window\.location\.replace/);
    assert.doesNotMatch(source, /router\.push[\s\S]{0,120}router\.refresh/);
  }
});
