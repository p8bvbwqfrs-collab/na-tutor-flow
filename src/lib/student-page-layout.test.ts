import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("student profiles put tutor work before progress, reporting and settings", () => {
  const source = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const overview = source.indexOf("Current position");
  const updatesAndHistory = source.indexOf("Updates and lesson history");
  const lessonHistory = source.indexOf("<StudentLessonHistory");
  const learningProgress = source.indexOf("Learning progress");
  const money = source.indexOf("student-money-heading");
  const paymentHistory = source.indexOf("<PaymentsMonthlySection");
  const studentSettings = source.indexOf("Student settings");

  assert.ok(overview >= 0);
  assert.ok(updatesAndHistory > overview);
  assert.ok(lessonHistory > updatesAndHistory);
  assert.ok(learningProgress > lessonHistory);
  assert.ok(money > learningProgress);
  assert.ok(paymentHistory > money);
  assert.ok(studentSettings > paymentHistory);
  assert.equal((source.match(/<StudentTrendChart/g) ?? []).length, 1);
});

test("student overview separates current status from updates and lesson history", () => {
  const source = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const paymentsSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/payments-monthly-section.tsx",
    "utf8",
  );

  assert.match(source, /student-overview-heading/);
  assert.match(source, />Outstanding</);
  assert.match(source, /attentionLessonLabel/);
  assert.match(source, /href=\{outstandingAmountPence > 0 && !isArchived \? "#payment-history" : "#money"\}/);
  assert.match(source, /href="#student-schedule"/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /Updates and lesson history/);
  assert.match(source, /<LessonUpdateActions/);
  assert.match(source, /<StudentLessonHistory/);
  assert.match(source, /Parent: \{student\.parent_name\}/);
  assert.match(source, /whitespace-nowrap/);
  assert.match(source, /overflow-hidden rounded-lg border border-zinc-200 bg-white/);
  assert.match(source, />\s*What we covered\s*</);
  assert.match(source, /grid border-t border-zinc-200 md:grid-cols-2/);
  assert.match(source, />\s*Next focus\s*</);
  assert.doesNotMatch(source, /sm:grid-cols-\[5\.5rem_minmax\(0,1fr\)\]/);
  assert.match(paymentsSource, /id="payment-history"/);
  assert.match(paymentsSource, /embedded/);
});

test("lesson history is responsive and shares one month with the parent-update generator", () => {
  const historySource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/student-lesson-history.tsx",
    "utf8",
  );
  const lessonsSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/past-lessons-monthly-section.tsx",
    "utf8",
  );
  const monthlyUpdateSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/monthly-summary-generator.tsx",
    "utf8",
  );

  assert.equal((historySource.match(/<MonthControls/g) ?? []).length, 1);
  assert.match(historySource, /selectedMonthKey=\{selectedMonthKey\}/);
  assert.match(historySource, />\s*Lesson history\s*</);
  assert.doesNotMatch(lessonsSource, /<table/);
  assert.match(lessonsSource, /sm:grid-cols-\[8\.5rem_minmax\(0,1fr\)_auto\]/);
  assert.match(lessonsSource, /tags\.slice\(0, 2\)/);
  assert.match(monthlyUpdateSource, /<details/);
  assert.match(monthlyUpdateSource, /Nothing is sent automatically/);
  assert.match(monthlyUpdateSource, /aria-live="polite"/);
});

test("dashboard lesson cards keep actions together without repeated section descriptions", () => {
  const source = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");

  assert.match(source, /md:flex-nowrap md:justify-end/);
  assert.match(source, /mt-4 space-y-5/);
  assert.doesNotMatch(source, /section\.description/);
  assert.doesNotMatch(source, /The scheduled date has passed/);
  assert.doesNotMatch(source, /Your next scheduled lessons after today/);
});
