import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("student profiles put tutor work before progress, reporting and settings", () => {
  const source = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const overview = source.indexOf("At a glance");
  const latestUpdate = source.indexOf("Latest parent update");
  const learningProgress = source.indexOf("Learning progress");
  const monthlySummary = source.indexOf("MonthlySummaryGenerator studentName");
  const pastLessons = source.indexOf("<PastLessonsMonthlySection");
  const money = source.indexOf("student-money-heading");
  const paymentHistory = source.indexOf("<PaymentsMonthlySection");
  const studentSettings = source.indexOf("Student settings");

  assert.ok(overview >= 0);
  assert.ok(latestUpdate > overview);
  assert.ok(learningProgress > latestUpdate);
  assert.ok(monthlySummary > learningProgress);
  assert.ok(pastLessons > monthlySummary);
  assert.ok(money > pastLessons);
  assert.ok(paymentHistory > money);
  assert.ok(studentSettings > paymentHistory);
  assert.equal((source.match(/<StudentTrendChart/g) ?? []).length, 1);
});

test("student overview foregrounds parent updates, outstanding money and the next lesson", () => {
  const source = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const paymentsSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/payments-monthly-section.tsx",
    "utf8",
  );

  assert.match(source, /student-overview-heading/);
  assert.match(source, />Parent update</);
  assert.match(source, />Outstanding</);
  assert.match(source, /attentionLessonLabel/);
  assert.match(source, /href="#latest-parent-update"/);
  assert.match(source, /href=\{outstandingAmountPence > 0 && !isArchived \? "#payment-history" : "#money"\}/);
  assert.match(source, /href="#student-schedule"/);
  assert.match(source, /md:grid-cols-3/);
  assert.match(source, /whitespace-nowrap/);
  assert.match(source, /mt-auto pt-4/);
  assert.match(paymentsSource, /id="payment-history"/);
});

test("dashboard lesson cards keep actions together without repeated section descriptions", () => {
  const source = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");

  assert.match(source, /md:flex-nowrap md:justify-end/);
  assert.match(source, /mt-4 space-y-5/);
  assert.doesNotMatch(source, /section\.description/);
  assert.doesNotMatch(source, /The scheduled date has passed/);
  assert.doesNotMatch(source, /Your next scheduled lessons after today/);
});
