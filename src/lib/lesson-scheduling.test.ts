import assert from "node:assert/strict";
import test from "node:test";
import {
  formatTimeLocal,
  getDateKeyLocal,
  getLondonDateTimeInputValues,
} from "./datetime";
import { getSubmittedLessonAtIso } from "./lesson-scheduling";

function submittedValues(date: string, time: string) {
  const values = new Map<string, string>([
    ["lesson_date", date],
    ["lesson_time", time],
  ]);

  return {
    get(name: string) {
      return values.get(name) ?? null;
    },
  };
}

test("creation persists the submitted UK summer time rather than an initial value", () => {
  const lessonAt = getSubmittedLessonAtIso(submittedValues("2026-07-15", "18:00"));

  assert.equal(lessonAt, "2026-07-15T17:00:00.000Z");
});

test("editing persists the submitted UK winter time rather than an initial value", () => {
  const lessonAt = getSubmittedLessonAtIso(submittedValues("2026-01-15", "18:00"));

  assert.equal(lessonAt, "2026-01-15T18:00:00.000Z");
});

test("page reload restores the saved London date and time", () => {
  assert.deepEqual(getLondonDateTimeInputValues("2026-07-15T17:00:00.000Z"), {
    date: "2026-07-15",
    time: "18:00",
  });
  assert.deepEqual(getLondonDateTimeInputValues("2026-01-15T18:00:00.000Z"), {
    date: "2026-01-15",
    time: "18:00",
  });
});

test("calendar display keeps the submitted London time in summer and winter", () => {
  const summerLessonAt = getSubmittedLessonAtIso(submittedValues("2026-07-15", "18:00"));
  const winterLessonAt = getSubmittedLessonAtIso(submittedValues("2026-01-15", "18:00"));

  assert.equal(getDateKeyLocal(summerLessonAt), "2026-07-15");
  assert.equal(formatTimeLocal(summerLessonAt), "18:00");
  assert.equal(getDateKeyLocal(winterLessonAt), "2026-01-15");
  assert.equal(formatTimeLocal(winterLessonAt), "18:00");
});
