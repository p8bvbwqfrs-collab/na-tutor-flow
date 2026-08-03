import assert from "node:assert/strict";
import test from "node:test";
import {
  buildIncomeTrendSeries,
  buildStudentFinancialSummaries,
  getReportingMonthStarts,
  getReportingRange,
  getReportingRangeLabel,
  isInReportingRange,
} from "./financial-reporting";

const now = new Date("2026-08-15T12:00:00.000Z");

test("defaults reporting to this month and accepts the supported presets", () => {
  assert.equal(getReportingRange(undefined), "month");
  assert.equal(getReportingRange("custom"), "month");
  assert.equal(getReportingRange("12m"), "12m");
  assert.equal(getReportingRangeLabel("month"), "This month");
  assert.equal(getReportingRangeLabel("all"), "All time");
});

test("builds inclusive calendar-month ranges across a year boundary", () => {
  const starts = getReportingMonthStarts("3m", new Date("2026-01-15T12:00:00.000Z"));

  assert.deepEqual(
    starts?.map((date) => date.toISOString().slice(0, 7)),
    ["2025-11", "2025-12", "2026-01"],
  );
  assert.equal(isInReportingRange("2025-11-01T00:00:00.000Z", "3m", new Date("2026-01-15T12:00:00.000Z")), true);
  assert.equal(isInReportingRange("2025-10-31T23:59:59.000Z", "3m", new Date("2026-01-15T12:00:00.000Z")), false);
});

test("uses the Europe/London month at the UTC boundary", () => {
  const londonAugust = new Date("2026-07-31T23:30:00.000Z");

  assert.equal(isInReportingRange("2026-08-01T08:00:00.000Z", "month", londonAugust), true);
  assert.equal(isInReportingRange("2026-07-31T08:00:00.000Z", "month", londonAugust), false);
});

test("uses the tutor month at an American UTC boundary", () => {
  const stillJulyInNewYork = new Date("2026-08-01T02:30:00.000Z");

  assert.equal(
    isInReportingRange(
      "2026-07-15T12:00:00.000Z",
      "month",
      stillJulyInNewYork,
      "America/New_York",
    ),
    true,
  );
  assert.equal(
    isInReportingRange(
      "2026-08-01T12:00:00.000Z",
      "month",
      stillJulyInNewYork,
      "America/New_York",
    ),
    false,
  );
});

test("summarises received income in range while keeping outstanding as the current balance", () => {
  const summaries = buildStudentFinancialSummaries(
    [
      { id: "student-a", student_name: "Asha", archived_at: null },
      { id: "student-b", student_name: "Ben", archived_at: null },
    ],
    [
      {
        student_id: "student-a",
        amount_pence: 5000,
        payment_date: "2026-08-05",
        created_at: "2026-08-05T10:00:00Z",
      },
      {
        student_id: "student-a",
        amount_pence: 4000,
        payment_date: "2026-07-05",
        created_at: "2026-07-05T10:00:00Z",
      },
      {
        student_id: "student-b",
        amount_pence: 3000,
        payment_date: "2026-08-08",
        created_at: "2026-08-08T10:00:00Z",
      },
    ],
    [
      {
        id: "lesson-a",
        student_id: "student-a",
        lesson_at: "2026-07-20T16:00:00Z",
        fee_pence: 5000,
      },
      {
        id: "lesson-b",
        student_id: "student-b",
        lesson_at: "2026-08-10T16:00:00Z",
        fee_pence: 3000,
      },
    ],
    [
      { payment_id: "payment-a", lesson_id: "lesson-a", amount_pence: 2000 },
      { payment_id: "payment-b", lesson_id: "lesson-b", amount_pence: 3000 },
    ],
    "month",
    now,
  );

  assert.deepEqual(summaries, [
    {
      id: "student-a",
      studentName: "Asha",
      archivedAt: null,
      receivedPence: 5000,
      outstandingPence: 3000,
      completedLessons: 0,
    },
    {
      id: "student-b",
      studentName: "Ben",
      archivedAt: null,
      receivedPence: 3000,
      outstandingPence: 0,
      completedLessons: 1,
    },
  ]);
});

test("keeps archived students only when they have activity in the selected view", () => {
  const summaries = buildStudentFinancialSummaries(
    [
      { id: "active", student_name: "Active", archived_at: null },
      {
        id: "archived-empty",
        student_name: "Archived empty",
        archived_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "archived-paid",
        student_name: "Archived paid",
        archived_at: "2026-01-01T00:00:00Z",
      },
    ],
    [
      {
        student_id: "archived-paid",
        amount_pence: 2500,
        payment_date: "2026-08-01",
        created_at: "2026-08-01T10:00:00Z",
      },
    ],
    [],
    [],
    "month",
    now,
  );

  assert.deepEqual(
    summaries.map((summary) => summary.id),
    ["archived-paid", "active"],
  );
});

test("shows this month as weekly periods and marks current and future weeks clearly", () => {
  const series = buildIncomeTrendSeries(
    [
      {
        student_id: "student-a",
        amount_pence: 2000,
        payment_date: "2026-08-02",
        created_at: "2026-08-02T10:00:00Z",
      },
      {
        student_id: "student-a",
        amount_pence: 3000,
        payment_date: "2026-08-10",
        created_at: "2026-08-10T10:00:00Z",
      },
    ],
    "month",
    new Date("2026-08-15T12:00:00.000Z"),
  );

  assert.equal(series.viewLabel, "Weekly view");
  assert.deepEqual(
    series.points.map(({ label, amountPence, state }) => ({
      label,
      amountPence,
      state,
    })),
    [
      { label: "1-7", amountPence: 2000, state: "complete" },
      { label: "8-14", amountPence: 3000, state: "complete" },
      { label: "15-21 so far", amountPence: 0, state: "current" },
      { label: "22-31", amountPence: 0, state: "future" },
    ],
  );
});

test("uses monthly periods for fixed multi-month ranges and marks this month as incomplete", () => {
  const series = buildIncomeTrendSeries(
    [
      {
        student_id: "student-a",
        amount_pence: 4000,
        payment_date: "2026-07-05",
        created_at: "2026-07-05T10:00:00Z",
      },
      {
        student_id: "student-a",
        amount_pence: 2500,
        payment_date: "2026-08-05",
        created_at: "2026-08-05T10:00:00Z",
      },
    ],
    "3m",
    now,
  );

  assert.equal(series.viewLabel, "Monthly view");
  assert.deepEqual(
    series.points.map(({ label, amountPence, state }) => ({
      label,
      amountPence,
      state,
    })),
    [
      { label: "Jun", amountPence: 0, state: "complete" },
      { label: "Jul", amountPence: 4000, state: "complete" },
      { label: "Aug so far", amountPence: 2500, state: "current" },
    ],
  );
});

test("switches long all-time histories to quarters without changing received totals", () => {
  const series = buildIncomeTrendSeries(
    [
      {
        student_id: "student-a",
        amount_pence: 1000,
        payment_date: "2024-01-10",
        created_at: "2024-01-10T10:00:00Z",
      },
      {
        student_id: "student-a",
        amount_pence: 2500,
        payment_date: "2026-08-05",
        created_at: "2026-08-05T10:00:00Z",
      },
    ],
    "all",
    now,
  );

  assert.equal(series.viewLabel, "Quarterly view");
  assert.equal(series.points[0]?.label, "Q1 24");
  assert.equal(series.points.at(-1)?.label, "Q3 26 so far");
  assert.equal(
    series.points.reduce((sum, point) => sum + point.amountPence, 0),
    3500,
  );
});
