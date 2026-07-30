import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getPaymentStatusClassName,
  getPaymentStatusLabel,
} from "./payments";
import {
  getLessonStatusClassName,
  getLessonStatusLabel,
} from "./status-styles";

const calendarSource = readFileSync(
  new URL("../app/(authed)/app/calendar/calendar-grid.tsx", import.meta.url),
  "utf8",
);
const progressSource = readFileSync(
  new URL(
    "../app/(authed)/app/students/[id]/components/progress-signal-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const studentSource = readFileSync(
  new URL("../app/(authed)/app/students/[id]/page.tsx", import.meta.url),
  "utf8",
);
const authedLayoutSource = readFileSync(
  new URL("../app/(authed)/layout.tsx", import.meta.url),
  "utf8",
);
const publicLayoutSource = readFileSync(
  new URL("../app/(public)/layout.tsx", import.meta.url),
  "utf8",
);

test("lesson statuses have consistent text and semantic tones", () => {
  assert.equal(getLessonStatusLabel("planned"), "Scheduled");
  assert.equal(getLessonStatusLabel("completed"), "Completed");
  assert.equal(getLessonStatusLabel(null), "Completed");
  assert.equal(getLessonStatusLabel("cancelled"), "Cancelled");

  assert.match(getLessonStatusClassName("planned"), /border-blue-200 bg-blue-50 text-blue-800/);
  assert.match(
    getLessonStatusClassName("completed"),
    /border-emerald-200 bg-emerald-50 text-emerald-800/,
  );
  assert.match(
    getLessonStatusClassName("cancelled"),
    /border-rose-200 bg-rose-50 text-rose-800/,
  );
});

test("payment statuses pair labels with accessible semantic tones", () => {
  assert.equal(getPaymentStatusLabel("paid"), "Paid");
  assert.equal(getPaymentStatusLabel("part-paid"), "Part-paid");
  assert.equal(getPaymentStatusLabel("unpaid"), "Unpaid");

  assert.match(getPaymentStatusClassName("paid"), /border-emerald-200 bg-emerald-50 text-emerald-800/);
  assert.match(getPaymentStatusClassName("part-paid"), /border-blue-200 bg-blue-50 text-blue-800/);
  assert.match(getPaymentStatusClassName("unpaid"), /border-amber-200 bg-amber-50 text-amber-900/);
});

test("calendar and progress surfaces reuse the restrained semantic system", () => {
  assert.match(calendarSource, /getLessonStatusClassName/);
  assert.match(calendarSource, /getLessonStatusLabel/);
  assert.match(progressSource, /stable: "border-blue-200 bg-blue-50/);
  assert.match(progressSource, /attention: "border-rose-200 bg-rose-50/);
  assert.match(progressSource, /improving: "border-emerald-200 bg-emerald-50/);
});

test("archived state stays neutral and the Tutor Flow identity uses one blue accent", () => {
  assert.match(studentSource, /Archived student/);
  assert.match(studentSource, /border-zinc-300 bg-zinc-100/);
  assert.doesNotMatch(studentSource, /Archived student[\s\S]{0,180}amber/);
  assert.match(authedLayoutSource, /rounded-full bg-blue-700/);
  assert.match(publicLayoutSource, /rounded-full bg-blue-700/);
});
