import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  autoApplyPaymentToLessons,
  calculateStudentCredit,
  type AllocationLike,
  type LessonFeeLike,
  type PaymentLike,
} from "./payments";

const lessons: LessonFeeLike[] = [
  { id: "lesson-1", fee_pence: 5_000, lesson_at: "2026-07-01T16:00:00.000Z" },
  { id: "lesson-2", fee_pence: 5_000, lesson_at: "2026-07-08T16:00:00.000Z" },
  { id: "lesson-3", fee_pence: 5_000, lesson_at: "2026-07-15T16:00:00.000Z" },
];

test("an upfront payment clears the oldest outstanding lessons first", () => {
  const payment: PaymentLike = {
    id: "payment-1",
    amount_pence: 12_000,
    source: "recorded_payment",
  };
  const allocations: AllocationLike[] = [
    {
      payment_id: "payment-1",
      lesson_id: "lesson-1",
      amount_pence: 2_000,
      payment,
    },
  ];

  assert.deepEqual(autoApplyPaymentToLessons(payment, lessons, allocations), [
    { payment_id: "payment-1", lesson_id: "lesson-1", amount_pence: 3_000 },
    { payment_id: "payment-1", lesson_id: "lesson-2", amount_pence: 5_000 },
    { payment_id: "payment-1", lesson_id: "lesson-3", amount_pence: 2_000 },
  ]);
});

test("money left after outstanding lessons remains as student credit", () => {
  const payment: PaymentLike = {
    id: "payment-2",
    amount_pence: 12_000,
    source: "recorded_payment",
  };
  const newAllocations = autoApplyPaymentToLessons(payment, lessons.slice(0, 2), []);
  const allocations = newAllocations.map((allocation) => ({
    ...allocation,
    payment,
  }));

  assert.equal(calculateStudentCredit([payment], allocations), 2_000);
});

test("legacy imported payments cannot become reusable credit", () => {
  const importedPayment: PaymentLike = {
    id: "payment-imported",
    amount_pence: 5_000,
    source: "imported",
    note: "Imported from paid lesson",
  };

  assert.deepEqual(autoApplyPaymentToLessons(importedPayment, lessons, []), []);
  assert.equal(calculateStudentCredit([importedPayment], []), 0);
});

test("the tutor-facing payment workflow hides allocation bookkeeping", () => {
  const recordPaymentSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/record-payment-form.tsx",
    "utf8",
  );
  const lessonFormSource = readFileSync("src/app/(authed)/app/students/[id]/new-lesson/new-lesson-form.tsx", "utf8");
  const paymentsSectionSource = readFileSync(
    "src/app/(authed)/app/students/[id]/components/payments-monthly-section.tsx",
    "utf8",
  );
  const scheduleLessonSource = readFileSync(
    "src/app/(authed)/app/students/[id]/schedule-lesson/schedule-lesson-form.tsx",
    "utf8",
  );

  assert.match(recordPaymentSource, /Record a different payment/);
  assert.match(recordPaymentSource, /Record payment in advance/);
  assert.match(recordPaymentSource, /part-payment or one payment covering several lessons/);
  assert.match(recordPaymentSource, /money has been paid before a lesson/);
  assert.match(recordPaymentSource, /oldest outstanding lessons first/);
  assert.doesNotMatch(recordPaymentSource, /Sessions covered/);
  assert.doesNotMatch(recordPaymentSource, /Covers from/);
  assert.doesNotMatch(recordPaymentSource, /Apply to lessons automatically/);

  assert.match(lessonFormSource, /Mark this lesson as paid/);
  assert.match(lessonFormSource, /Existing credit will be applied automatically/);
  assert.doesNotMatch(lessonFormSource, /Use available credit for this lesson/);
  assert.match(lessonFormSource, /paid: false/);

  assert.match(paymentsSectionSource, /payment\.source === "recorded_payment"/);
  assert.match(scheduleLessonSource, /applyAvailableCreditToLesson\(lessonMutation\.data\.id\)/);
});

test("marking a lesson paid uses existing credit before recording new money", () => {
  const actionsSource = readFileSync("src/app/(authed)/app/payment-actions.ts", "utf8");
  const paymentActionStart = actionsSource.indexOf("export async function payOutstandingLessonAmount");
  const paymentActionEnd = actionsSource.indexOf("export async function markLessonPaid");
  const paymentActionSource = actionsSource.slice(paymentActionStart, paymentActionEnd);

  assert.ok(paymentActionStart >= 0);
  assert.ok(paymentActionEnd > paymentActionStart);
  assert.ok(
    paymentActionSource.indexOf("applyAvailableCreditToLesson") <
      paymentActionSource.indexOf("insertReceivedPaymentForLesson"),
  );
});

test("the dashboard groups timeframe reporting and payment actions under Money", () => {
  const dashboardSource = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");
  const unpaidLessonsSource = readFileSync(
    "src/app/(authed)/app/dashboard/components/unpaid-lessons-section.tsx",
    "utf8",
  );

  const moneyHeading = dashboardSource.indexOf('id="money-heading"');
  const atAGlanceHeading = dashboardSource.indexOf("At a glance");
  const unpaidSection = dashboardSource.indexOf("<UnpaidLessonsSection");
  const studentHeading = dashboardSource.indexOf('id="student-income-heading"');
  const incomeHeading = dashboardSource.indexOf('id="income-trend-heading"');
  const recentHeading = dashboardSource.indexOf('id="recent-activity-heading"');

  assert.ok(moneyHeading >= 0);
  assert.ok(atAGlanceHeading > moneyHeading);
  assert.ok(unpaidSection > atAGlanceHeading);
  assert.ok(studentHeading > unpaidSection);
  assert.ok(incomeHeading > studentHeading);
  assert.ok(recentHeading > incomeHeading);
  assert.match(dashboardSource, /Outstanding now/);
  assert.match(dashboardSource, /Active students/);
  assert.match(dashboardSource, /By student/);
  assert.match(dashboardSource, /Income over time/);
  assert.match(dashboardSource, /buildIncomeTrendSeries/);
  assert.match(unpaidLessonsSource, /Unpaid lessons/);
  assert.match(unpaidLessonsSource, /MarkPaidButton/);
  assert.match(dashboardSource, /Recent activity/);
  assert.match(dashboardSource, /Received and completed figures use the selected timeframe/);
  assert.doesNotMatch(dashboardSource, /Paid vs unpaid/);
});

test("student profiles reuse the same timeframe money summary", () => {
  const studentSource = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");

  assert.match(studentSource, /title="Money"/);
  assert.match(studentSource, /Outstanding now/);
  assert.match(studentSource, /Last payment/);
  assert.match(studentSource, /ChartRangeFilter/);
  assert.match(studentSource, /receivedInRangePence/);
});

test("income periods expose exact values to pointer and keyboard users", () => {
  const chartSource = readFileSync(
    "src/app/(authed)/app/dashboard/components/income-trend-chart.tsx",
    "utf8",
  );

  assert.match(chartSource, /aria-label={`\$\{point\.accessibleLabel\}: \$\{amountLabel\}`}/);
  assert.match(chartSource, /tabIndex={0}/);
  assert.match(chartSource, /group-hover:opacity-100/);
  assert.match(chartSource, /group-focus-visible:opacity-100/);
});
