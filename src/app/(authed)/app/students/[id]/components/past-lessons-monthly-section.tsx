"use client";

import Link from "next/link";
import { formatDateLocal, formatTimeLocal, getMonthKeyLocal } from "@/lib/datetime";
import {
  calculateLessonPaymentStatus,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
} from "@/lib/payments";

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
        const tags = lesson.topic_tags ?? [];

        return (
          <li key={lesson.id}>
            <Link
              href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
              className="group grid min-w-0 gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-900">
                  {formatDateLocal(lesson.lesson_at, timeZone)}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {formatTimeLocal(lesson.lesson_at, timeZone)}
                </span>
              </span>

              <span className="min-w-0">
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
              </span>

              <span className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end">
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                >
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
                <span className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 group-hover:decoration-zinc-700">
                  View notes
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
