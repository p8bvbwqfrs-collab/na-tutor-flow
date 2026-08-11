import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMonthlyParentUpdate,
  type MonthlyParentUpdateLesson,
} from "./monthly-parent-update";

const baseLesson: MonthlyParentUpdateLesson = {
  lesson_at: "2026-07-03T16:00:00.000Z",
  topics: "Algebraic fractions",
  topic_tags: ["Algebra"],
  effort: 4,
  confidence: 3,
  went_well: "More confident with substitution steps",
  parent_note: "Worked independently for longer today.",
  improve: "Check the final simplification",
  homework: "Complete the algebraic fractions sheet",
};

test("builds a concise parent-facing update without empty placeholder sections", () => {
  const update = buildMonthlyParentUpdate({
    studentName: "Ava",
    monthKey: "2026-07",
    lessons: [
      baseLesson,
      {
        ...baseLesson,
        lesson_at: "2026-07-17T16:00:00.000Z",
        topics: "Algebraic fractions; Rearranging formulae",
        confidence: 4,
        effort: 5,
        went_well: "More confidence with substitution",
        parent_note: null,
        improve: "Check final simplification carefully",
        homework: null,
      },
    ],
    timeZone: "Europe/London",
  });

  assert.match(update, /Ava – monthly update \(July 2026\)/);
  assert.match(update, /We completed 2 lessons this month\./);
  assert.match(update, /What we covered/);
  assert.match(update, /Progress and strengths/);
  assert.match(update, /Next focus/);
  assert.doesNotMatch(update, /None yet/);
  assert.equal((update.match(/Check (the )?final simplification/gi) ?? []).length, 1);
});

test("describes recorded learning movement and includes the next scheduled lesson", () => {
  const update = buildMonthlyParentUpdate({
    studentName: "Ava",
    monthKey: "2026-07",
    lessons: [baseLesson, { ...baseLesson, lesson_at: "2026-07-24T16:00:00.000Z", confidence: 5 }],
    timeZone: "Europe/London",
    nextLessonAt: "2026-08-07T15:00:00.000Z",
  });

  assert.match(update, /confidence increased from 3\/5 to 5\/5/);
  assert.match(update, /Average effort was 4\.0\/5/);
  assert.match(update, /Next lesson scheduled: 07 Aug at 16:00/);
});

test("uses singular parent-facing language for one lesson", () => {
  const update = buildMonthlyParentUpdate({
    studentName: "Ava",
    monthKey: "2026-07",
    lessons: [baseLesson],
    timeZone: "Europe/London",
  });

  assert.match(update, /We completed 1 lesson this month\./);
  assert.match(update, /confidence was 3\/5 and effort was 4\/5 for this lesson/);
});
