import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  deriveDashboardExperience,
  getDashboardActions,
  getLessonWorkflowHref,
  type DashboardStudent,
} from "./dashboard-onboarding";

const activeStudent: DashboardStudent = {
  id: "active-student",
  studentName: "Active student",
  archivedAt: null,
};

test("zero students shows the add-student onboarding state", () => {
  const experience = deriveDashboardExperience([], false);

  assert.equal(experience.state, "no_active_students");
  assert.deepEqual(getDashboardActions(experience.state, experience.activeStudents), [
    { label: "Add your first student", href: "/app/students/new" },
  ]);
});

test("one active student with no lessons shows lesson onboarding", () => {
  const experience = deriveDashboardExperience([activeStudent], false);

  assert.equal(experience.state, "student_ready");
  assert.deepEqual(getDashboardActions(experience.state, experience.activeStudents), [
    { label: "Log a lesson", href: "/app/students/active-student/new-lesson" },
    { label: "Schedule a lesson", href: "/app/students/active-student/schedule-lesson" },
  ]);
  assert.equal(getLessonWorkflowHref("log", experience.activeStudents), "/app/students/active-student/new-lesson");
  assert.equal(
    getLessonWorkflowHref("schedule", experience.activeStudents),
    "/app/students/active-student/schedule-lesson",
  );
});

test("an existing lesson removes onboarding and shows quick actions", () => {
  const experience = deriveDashboardExperience([activeStudent], true);

  assert.equal(experience.state, "lessons_started");
  assert.deepEqual(getDashboardActions(experience.state, experience.activeStudents), [
    { label: "Add student", href: "/app/students/new" },
    { label: "Log lesson", href: "/app/students/active-student/new-lesson" },
    { label: "Schedule lesson", href: "/app/students/active-student/schedule-lesson" },
  ]);
});

test("archived students do not count as active onboarding students", () => {
  const archivedStudent = { ...activeStudent, archivedAt: "2026-07-27T10:00:00.000Z" };
  const experience = deriveDashboardExperience([archivedStudent], true);

  assert.equal(experience.state, "no_active_students");
  assert.deepEqual(experience.activeStudents, []);
});

test("multiple students use the established Students selection workflow", () => {
  const students = [activeStudent, { ...activeStudent, id: "second-student" }];

  assert.equal(getLessonWorkflowHref("log", students), "/app/students?lessonAction=log");
  assert.equal(getLessonWorkflowHref("schedule", students), "/app/students?lessonAction=schedule");
});

test("dashboard actions use a non-overflowing mobile layout without a nested main landmark", async () => {
  const source = await readFile("src/app/(authed)/app/dashboard/page.tsx", "utf8");

  assert.match(source, /grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap/);
  assert.match(source, /w-full min-w-0/);
  assert.doesNotMatch(source, /<main[\s>]/);
});
