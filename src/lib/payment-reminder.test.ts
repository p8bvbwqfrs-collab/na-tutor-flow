import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildPaymentReminder } from "./payment-reminder";

test("builds a polite reminder from outstanding lessons in chronological order", () => {
  const reminder = buildPaymentReminder({
    studentName: "Harris",
    parentName: "Sam",
    currencyCode: "GBP",
    timeZone: "Europe/London",
    outstandingLessons: [
      { lessonAt: "2026-08-11T15:00:00.000Z", outstandingPence: 5000 },
      { lessonAt: "2026-08-04T15:00:00.000Z", outstandingPence: 4500 },
    ],
  });

  assert.match(reminder, /^Hi Sam,/);
  assert.match(reminder, /£95\.00 remains outstanding for Harris’s tutoring \(2 lessons\)/);
  assert.ok(reminder.indexOf("04 Aug") < reminder.indexOf("11 Aug"));
  assert.match(reminder, /If you have already sent this payment/);
});

test("omits non-outstanding lessons and uses a neutral greeting without a contact name", () => {
  const reminder = buildPaymentReminder({
    studentName: "Ava",
    parentName: null,
    currencyCode: "USD",
    timeZone: "America/New_York",
    outstandingLessons: [
      { lessonAt: "2026-08-11T20:00:00.000Z", outstandingPence: 6000 },
      { lessonAt: "2026-08-04T20:00:00.000Z", outstandingPence: 0 },
    ],
  });

  assert.match(reminder, /^Hi,/);
  assert.match(reminder, /\$60\.00 remains outstanding for Ava’s tutoring \(1 lesson\)/);
  assert.doesNotMatch(reminder, /04 Aug/);
});

test("returns no draft when nothing is outstanding", () => {
  assert.equal(
    buildPaymentReminder({
      studentName: "Ava",
      currencyCode: "GBP",
      timeZone: "Europe/London",
      outstandingLessons: [],
    }),
    "",
  );
});

test("the reminder UI stays editable, accessible and tutor-controlled", () => {
  const source = readFileSync(
    "src/app/(authed)/app/students/[id]/components/payment-reminder-generator.tsx",
    "utf8",
  );

  assert.match(source, /Nothing is sent automatically/);
  assert.match(source, /<textarea/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /aria-controls=\{panelId\}/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /trackActivationStep\("payment_reminder_shared"\)/);
});
