import { getMonthKeyLocal } from "@/lib/datetime";
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

  return Array.from({ length: monthCount }, (_, index) =>
    new Date(Date.UTC(londonYear, londonMonth - 1 - (monthCount - 1 - index), 1)),
  );
}

export function isInReportingRange(
  value: string | Date,
  range: ReportingRange,
  now = new Date(),
) {
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
