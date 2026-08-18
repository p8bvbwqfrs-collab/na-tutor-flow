"use client";

import Link from "next/link";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateLocal, formatTimeLocal, getMonthKeyLocal } from "@/lib/datetime";
import {
  calculateLessonPaymentStatus,
  getOutstandingLessonAmount,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
} from "@/lib/payments";
import { LessonPaidToggle } from "./lesson-paid-toggle";

type PastLesson = {
  id: string;
  lesson_at: string;
  topics: string;
  topic_tags: string[] | null;
  fee_pence: number;
};

type PastLessonsMonthlySectionProps = {
  studentId: string;
  lessons: PastLesson[];
  allocations: AllocationLike[];
  selectedMonthKey: string;
  timeZone: string;
  hasLessonsError: boolean;
  currencyCode: SupportedCurrencyCode;
  readOnly?: boolean;
};

function cleanLessonText(value: string) {
  return value
    .split(/\n|;/)
    .map((part) => part.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

export function PastLessonsMonthlySection({
  studentId,
  lessons,
  allocations,
  selectedMonthKey,
  timeZone,
  hasLessonsError,
  currencyCode,
  readOnly = false,
}: PastLessonsMonthlySectionProps) {
  const lessonsForMonth = lessons.filter(
    (lesson) => getMonthKeyLocal(lesson.lesson_at, timeZone) === selectedMonthKey,
  );

  if (hasLessonsError) {
    return (
      <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
        Could not load lessons.
      </p>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <p className="text-sm font-medium text-zinc-900">No lessons logged yet.</p>
        <p className="mt-1 text-sm text-zinc-600">
          Log a lesson to start building this student&apos;s notes and parent updates.
        </p>
      </div>
    );
  }

  if (lessonsForMonth.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
        No completed lessons recorded this month.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {lessonsForMonth.map((lesson) => {
        const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);
        const outstandingPence = getOutstandingLessonAmount(lesson, allocations);
        const tags = lesson.topic_tags ?? [];

        return (
          <li
            key={lesson.id}
            className="grid min-w-0 gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <span className="block text-sm font-medium text-zinc-900">
                {formatDateLocal(lesson.lesson_at, timeZone)}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                {formatTimeLocal(lesson.lesson_at, timeZone)}
              </span>
            </div>

            <div className="min-w-0">
              <span className="line-clamp-2 block break-words text-sm font-medium leading-6 text-zinc-900">
                {cleanLessonText(lesson.topics) || "No lesson focus recorded"}
              </span>
              {tags.length > 0 ? (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex max-w-full rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                    >
                      <span className="truncate">{tag}</span>
                    </span>
                  ))}
                  {tags.length > 2 ? (
                    <span className="text-xs text-zinc-500">+{tags.length - 2} more</span>
                  ) : null}
                </span>
              ) : null}
            </div>

            <div className="grid gap-2 sm:justify-items-end">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                >
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
                {outstandingPence > 0 ? (
                  <span className="text-xs font-medium text-amber-900">
                    {formatCurrencyFromMinorUnits(outstandingPence, currencyCode)} remaining
                  </span>
                ) : null}
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                {!readOnly && outstandingPence > 0 ? (
                  <LessonPaidToggle
                    lessonId={lesson.id}
                    status={paymentStatus}
                    compact
                  />
                ) : null}
                <Link
                  href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
                  className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                >
                  View notes
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
