import {
  formatCurrencyFromMinorUnits,
  type SupportedCurrencyCode,
} from "@/lib/currency";
import { formatShortDateLocal } from "@/lib/datetime";

export type OutstandingLessonForReminder = {
  lessonAt: string;
  outstandingPence: number;
};

export function buildPaymentReminder({
  studentName,
  parentName,
  outstandingLessons,
  currencyCode,
  timeZone,
}: {
  studentName: string;
  parentName?: string | null;
  outstandingLessons: OutstandingLessonForReminder[];
  currencyCode: SupportedCurrencyCode;
  timeZone: string;
}) {
  const lessons = outstandingLessons
    .filter((lesson) => lesson.outstandingPence > 0)
    .sort(
      (left, right) =>
        new Date(left.lessonAt).getTime() - new Date(right.lessonAt).getTime(),
    );

  if (lessons.length === 0) return "";

  const totalPence = lessons.reduce((sum, lesson) => sum + lesson.outstandingPence, 0);
  const visibleLessons = lessons.slice(0, 5);
  const remainingLessons = lessons.length - visibleLessons.length;
  const greeting = parentName?.trim() ? `Hi ${parentName.trim()},` : "Hi,";
  const lessonWord = lessons.length === 1 ? "lesson" : "lessons";
  const lines = [
    greeting,
    "",
    `Just a quick reminder that ${formatCurrencyFromMinorUnits(totalPence, currencyCode)} remains outstanding for ${studentName}’s tutoring (${lessons.length} ${lessonWord}):`,
    "",
    ...visibleLessons.map(
      (lesson) =>
        `• ${formatShortDateLocal(lesson.lessonAt, timeZone)} — ${formatCurrencyFromMinorUnits(lesson.outstandingPence, currencyCode)}`,
    ),
  ];

  if (remainingLessons > 0) {
    lines.push(`• Plus ${remainingLessons} more ${remainingLessons === 1 ? "lesson" : "lessons"}`);
  }

  lines.push(
    "",
    "If you have already sent this payment, please ignore this message. Thank you.",
  );

  return lines.join("\n");
}
