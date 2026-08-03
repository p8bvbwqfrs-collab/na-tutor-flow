import { formatMonthLocal, formatMonthShortLocal, getDateKeyLocal, getMonthKeyLocal } from "@/lib/datetime";
import { getOutstandingLessonAmount, type AllocationLike } from "@/lib/payments";

export type ReportingRange = "month" | "3m" | "6m" | "12m" | "all";

export type ReportingPayment = {
  student_id: string;
  amount_pence: number;
  payment_date: string | null;
  created_at: string;
};

export type ReportingLesson = {
  id: string;
  student_id: string;
  lesson_at: string;
  fee_pence: number;
};

export type ReportingStudent = {
  id: string;
  student_name: string;
  archived_at: string | null;
};

export type IncomeTrendPoint = {
  key: string;
  label: string;
  accessibleLabel: string;
  amountPence: number;
  state: "complete" | "current" | "future";
};

export type IncomeTrendSeries = {
  points: IncomeTrendPoint[];
  viewLabel: "Weekly view" | "Monthly view" | "Quarterly view";
};

export function getReportingRange(value: string | undefined): ReportingRange {
  if (value === "month" || value === "3m" || value === "6m" || value === "12m" || value === "all") {
    return value;
  }

  return "month";
}

export function getReportingRangeLabel(range: ReportingRange) {
  if (range === "month") {
    return "This month";
  }

  if (range === "3m") {
    return "Last 3 months";
  }

  if (range === "6m") {
    return "Last 6 months";
  }

  if (range === "12m") {
    return "Last 12 months";
  }

  return "All time";
}

export function getReportingMonthStarts(range: ReportingRange, now = new Date()) {
  if (range === "all") {
    return null;
  }

  const monthCount = range === "month" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12;
  const [londonYear, londonMonth] = getMonthKeyLocal(now).split("-").map(Number);

  return Array.from(
    { length: monthCount },
    (_, index) => new Date(Date.UTC(londonYear, londonMonth - 1 - (monthCount - 1 - index), 1)),
  );
}

export function isInReportingRange(value: string | Date, range: ReportingRange, now = new Date()) {
  const monthStarts = getReportingMonthStarts(range, now);

  if (!monthStarts) {
    return true;
  }

  const includedMonths = new Set(monthStarts.map((month) => getMonthKeyLocal(month)));
  return includedMonths.has(getMonthKeyLocal(value));
}

export function getPaymentReportingDate(payment: ReportingPayment) {
  return payment.payment_date ?? payment.created_at;
}

function getMonthSeriesBetween(startInclusive: Date, endInclusive: Date) {
  const [startYear, startMonth] = getMonthKeyLocal(startInclusive).split("-").map(Number);
  const [endYear, endMonth] = getMonthKeyLocal(endInclusive).split("-").map(Number);
  const start = new Date(Date.UTC(startYear, startMonth - 1, 1));
  const end = new Date(Date.UTC(endYear, endMonth - 1, 1));
  const months: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

function buildWeeklyIncomeTrend(payments: ReportingPayment[], now: Date): IncomeTrendSeries {
  const [year, month, currentDay] = getDateKeyLocal(now).split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthName = formatMonthLocal(now);
  const weekBounds = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, lastDay],
  ];

  const points = weekBounds.map(([startDay, endDay], index) => {
    const amountPence = payments.reduce((sum, payment) => {
      const [paymentYear, paymentMonth, paymentDay] = getDateKeyLocal(getPaymentReportingDate(payment))
        .split("-")
        .map(Number);

      return paymentYear === year && paymentMonth === month && paymentDay >= startDay && paymentDay <= endDay
        ? sum + payment.amount_pence
        : sum;
    }, 0);
    const state = startDay > currentDay ? "future" : endDay >= currentDay ? "current" : "complete";
    const periodLabel = `${startDay}-${endDay}`;

    return {
      key: `${year}-${String(month).padStart(2, "0")}-week-${index + 1}`,
      label: state === "current" ? `${periodLabel} so far` : periodLabel,
      accessibleLabel: `${startDay} to ${endDay} ${monthName}${
        state === "current" ? ", so far" : state === "future" ? ", upcoming" : ""
      }`,
      amountPence,
      state,
    } satisfies IncomeTrendPoint;
  });

  return { points, viewLabel: "Weekly view" };
}

function buildMonthlyIncomeTrend(payments: ReportingPayment[], range: ReportingRange, now: Date): IncomeTrendSeries {
  const fixedMonthStarts = getReportingMonthStarts(range, now);
  const oldestPaymentAt = payments.reduce<Date | null>((oldest, payment) => {
    const paymentDate = new Date(getPaymentReportingDate(payment));
    return !oldest || paymentDate < oldest ? paymentDate : oldest;
  }, null);
  const monthStarts = fixedMonthStarts ?? (oldestPaymentAt ? getMonthSeriesBetween(oldestPaymentAt, now) : []);
  const currentMonthKey = getMonthKeyLocal(now);
  const amountsByMonth = new Map<string, number>();

  monthStarts.forEach((month) => amountsByMonth.set(getMonthKeyLocal(month), 0));
  payments.forEach((payment) => {
    const key = getMonthKeyLocal(getPaymentReportingDate(payment));
    if (amountsByMonth.has(key)) {
      amountsByMonth.set(key, (amountsByMonth.get(key) ?? 0) + payment.amount_pence);
    }
  });

  return {
    viewLabel: "Monthly view",
    points: monthStarts.map((month) => {
      const key = getMonthKeyLocal(month);
      const isCurrent = key === currentMonthKey;
      return {
        key,
        label: `${formatMonthShortLocal(month)}${isCurrent ? " so far" : ""}`,
        accessibleLabel: `${formatMonthLocal(month)}${isCurrent ? ", so far" : ""}`,
        amountPence: amountsByMonth.get(key) ?? 0,
        state: isCurrent ? "current" : "complete",
      };
    }),
  };
}

function buildQuarterlyIncomeTrend(payments: ReportingPayment[], now: Date): IncomeTrendSeries {
  const oldestPayment = payments.reduce<Date | null>((oldest, payment) => {
    const paymentDate = new Date(getPaymentReportingDate(payment));
    return !oldest || paymentDate < oldest ? paymentDate : oldest;
  }, null);

  if (!oldestPayment) {
    return { points: [], viewLabel: "Quarterly view" };
  }

  const [oldestYear, oldestMonth] = getMonthKeyLocal(oldestPayment).split("-").map(Number);
  const [currentYear, currentMonth] = getMonthKeyLocal(now).split("-").map(Number);
  const startQuarter = Math.floor((oldestMonth - 1) / 3) + 1;
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
  const quarterKeys: string[] = [];
  let year = oldestYear;
  let quarter = startQuarter;

  while (year < currentYear || (year === currentYear && quarter <= currentQuarter)) {
    quarterKeys.push(`${year}-Q${quarter}`);
    quarter += 1;
    if (quarter === 5) {
      quarter = 1;
      year += 1;
    }
  }

  const amountsByQuarter = new Map(quarterKeys.map((key) => [key, 0]));
  payments.forEach((payment) => {
    const [paymentYear, paymentMonth] = getMonthKeyLocal(getPaymentReportingDate(payment)).split("-").map(Number);
    const paymentQuarter = Math.floor((paymentMonth - 1) / 3) + 1;
    const key = `${paymentYear}-Q${paymentQuarter}`;
    if (amountsByQuarter.has(key)) {
      amountsByQuarter.set(key, (amountsByQuarter.get(key) ?? 0) + payment.amount_pence);
    }
  });

  const currentKey = `${currentYear}-Q${currentQuarter}`;
  return {
    viewLabel: "Quarterly view",
    points: quarterKeys.map((key) => {
      const [pointYear, pointQuarter] = key.split("-Q");
      const isCurrent = key === currentKey;
      return {
        key,
        label: `Q${pointQuarter} ${pointYear.slice(2)}${isCurrent ? " so far" : ""}`,
        accessibleLabel: `Quarter ${pointQuarter} ${pointYear}${isCurrent ? ", so far" : ""}`,
        amountPence: amountsByQuarter.get(key) ?? 0,
        state: isCurrent ? "current" : "complete",
      };
    }),
  };
}

export function buildIncomeTrendSeries(
  payments: ReportingPayment[],
  range: ReportingRange,
  now = new Date(),
): IncomeTrendSeries {
  const reportingPayments = payments.filter((payment) =>
    isInReportingRange(getPaymentReportingDate(payment), range, now),
  );

  if (range === "month") {
    return buildWeeklyIncomeTrend(reportingPayments, now);
  }

  const monthlySeries = buildMonthlyIncomeTrend(reportingPayments, range, now);
  if (range !== "all" || monthlySeries.points.length <= 18) {
    return monthlySeries;
  }

  return buildQuarterlyIncomeTrend(reportingPayments, now);
}

export function buildStudentFinancialSummaries(
  students: ReportingStudent[],
  payments: ReportingPayment[],
  completedLessons: ReportingLesson[],
  allocations: AllocationLike[],
  range: ReportingRange,
  now = new Date(),
) {
  const summaries = new Map(
    students.map((student) => [
      student.id,
      {
        id: student.id,
        studentName: student.student_name,
        archivedAt: student.archived_at,
        receivedPence: 0,
        outstandingPence: 0,
        completedLessons: 0,
      },
    ]),
  );

  payments.forEach((payment) => {
    if (!isInReportingRange(getPaymentReportingDate(payment), range, now)) {
      return;
    }

    const summary = summaries.get(payment.student_id);
    if (summary) {
      summary.receivedPence += payment.amount_pence;
    }
  });

  completedLessons.forEach((lesson) => {
    const summary = summaries.get(lesson.student_id);
    if (!summary) {
      return;
    }

    summary.outstandingPence += getOutstandingLessonAmount(lesson, allocations);

    if (isInReportingRange(lesson.lesson_at, range, now)) {
      summary.completedLessons += 1;
    }
  });

  return [...summaries.values()]
    .filter(
      (summary) =>
        !summary.archivedAt ||
        summary.receivedPence > 0 ||
        summary.outstandingPence > 0 ||
        summary.completedLessons > 0,
    )
    .sort(
      (a, b) =>
        b.outstandingPence - a.outstandingPence ||
        b.receivedPence - a.receivedPence ||
        a.studentName.localeCompare(b.studentName),
    );
}
