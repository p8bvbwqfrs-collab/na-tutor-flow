import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getPlannedLessonAttention,
  getPlannedLessonAttentionLabel,
  partitionPlannedLessons,
} from "./lesson-attention";

test("planned lessons use Europe/London calendar days for attention state", () => {
  const now = "2026-07-15T23:30:00.000Z"; // 00:30 on 16 July in London

  assert.equal(getPlannedLessonAttention("2026-07-15T21:30:00.000Z", now), "overdue");
  assert.equal(getPlannedLessonAttention("2026-07-16T08:00:00.000Z", now), "today");
  assert.equal(getPlannedLessonAttention("2026-07-16T23:30:00.000Z", now), "upcoming");
});

test("planned lesson attention follows the tutor time zone", () => {
  const now = "2026-08-01T02:30:00.000Z"; // 31 July in New York

  assert.equal(
    getPlannedLessonAttention(
      "2026-08-01T01:00:00.000Z",
      now,
      "America/New_York",
    ),
    "today",
  );
  assert.equal(
    getPlannedLessonAttention(
      "2026-08-01T12:00:00.000Z",
      now,
      "America/New_York",
    ),
    "upcoming",
  );
});

test("planned lessons are sorted and partitioned without one group hiding another", () => {
  const lessons = [
    { id: "future", lesson_at: "2026-08-18T17:00:00.000Z" },
    { id: "overdue", lesson_at: "2026-08-16T17:00:00.000Z" },
    { id: "today-late", lesson_at: "2026-08-17T18:00:00.000Z" },
    { id: "today-early", lesson_at: "2026-08-17T08:00:00.000Z" },
  ];

  const result = partitionPlannedLessons(lessons, "2026-08-17T12:00:00.000Z");

  assert.deepEqual(result.overdue.map((lesson) => lesson.id), ["overdue"]);
  assert.deepEqual(result.today.map((lesson) => lesson.id), ["today-early", "today-late"]);
  assert.deepEqual(result.upcoming.map((lesson) => lesson.id), ["future"]);
});

test("attention labels use the same tutor-facing language throughout", () => {
  assert.equal(getPlannedLessonAttentionLabel("overdue"), "Needs completing");
  assert.equal(getPlannedLessonAttentionLabel("today"), "Today");
  assert.equal(getPlannedLessonAttentionLabel("upcoming"), "Upcoming");
});

test("dashboard, student and calendar surfaces use the shared attention workflow", () => {
  const dashboardSource = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");
  const studentSource = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const calendarSource = readFileSync("src/app/(authed)/app/calendar/calendar-grid.tsx", "utf8");

  assert.match(dashboardSource, /partitionPlannedLessons/);
  assert.match(dashboardSource, /Needs completing/);
  assert.match(dashboardSource, /Today(?:['’]s)? lessons/);
  assert.match(dashboardSource, /Next lessons/);
  assert.match(dashboardSource, />\s*Reschedule\s*</);
  assert.match(dashboardSource, /label="Cancel lesson"/);

  const plannedQueryStart = dashboardSource.indexOf('.eq("status", "planned")');
  const plannedQueryEnd = dashboardSource.indexOf('.from("payments")', plannedQueryStart);
  assert.ok(plannedQueryStart >= 0);
  assert.ok(plannedQueryEnd > plannedQueryStart);
  assert.doesNotMatch(dashboardSource.slice(plannedQueryStart, plannedQueryEnd), /\.limit\(/);

  assert.match(studentSource, /partitionPlannedLessons/);
  assert.match(calendarSource, /getPlannedLessonAttentionLabel/);
  assert.match(calendarSource, /attention === "overdue"/);
  assert.match(calendarSource, />\s*Complete lesson\s*</);
  assert.match(calendarSource, />\s*Reschedule\s*</);
  assert.match(calendarSource, /label="Cancel lesson"/);
  assert.match(calendarSource, /Archived student · Read-only/);
});
