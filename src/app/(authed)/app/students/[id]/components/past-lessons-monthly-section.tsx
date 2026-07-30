"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateLocal, formatTimeLocal, getMonthKeyLocal } from "@/lib/datetime";
import {
  calculateLessonPaymentStatus,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
  type AllocationLike,
} from "@/lib/payments";
import { LessonPaidToggle } from "./lesson-paid-toggle";
import { MonthControls } from "./month-controls";

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
  currencyCode: SupportedCurrencyCode;
  initialMonthKey: string;
  hasLessonsError: boolean;
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
  currencyCode,
  initialMonthKey,
  hasLessonsError,
  readOnly = false,
}: PastLessonsMonthlySectionProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
  const lessonsForMonth = lessons.filter((lesson) => getMonthKeyLocal(lesson.lesson_at) === selectedMonthKey);

  return (
    <section>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div>
          <h2 className="text-lg font-medium text-zinc-900">Past lessons</h2>
          <div className="mt-1">
            <MonthControls
              monthKey={selectedMonthKey}
              onChange={setSelectedMonthKey}
              label={`${lessonsForMonth.length} ${lessonsForMonth.length === 1 ? "lesson" : "lessons"}`}
            />
          </div>
        </div>
        {hasLessonsError ? (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            Could not load lessons.
          </p>
        ) : lessons.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-900">No lessons logged yet.</p>
            <p className="mt-2 text-sm text-zinc-600">
              Log your first lesson to track progress and generate update messages.
            </p>
            {!readOnly ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/app/students/${studentId}/new-lesson`}
                  className="inline-flex rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Log lesson
                </Link>
                <Link
                  href={`/app/students/${studentId}/schedule-lesson`}
                  className="inline-flex rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Schedule lesson
                </Link>
              </div>
            ) : null}
          </div>
        ) : lessonsForMonth.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            No lessons recorded this month.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Topics</th>
                  <th className="px-3 py-2 font-medium">Fee</th>
                  <th className="px-3 py-2 font-medium">Paid</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessonsForMonth.map((lesson) => {
                  const paymentStatus = calculateLessonPaymentStatus(lesson, allocations);

                  return (
                    <tr key={lesson.id} className="border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-3 py-4 align-middle text-zinc-900">
                        <Link
                          href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
                          className="block underline-offset-4 hover:underline"
                        >
                          <span className="block text-zinc-900">{formatDateLocal(lesson.lesson_at)}</span>
                          <span className="mt-1 block text-xs text-zinc-500">
                            {formatTimeLocal(lesson.lesson_at)}
                          </span>
                        </Link>
                      </td>
                      <td className="max-w-sm px-3 py-4 align-middle text-zinc-900" title={lesson.topics}>
                        <Link
                          href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
                          className="block underline-offset-4 hover:underline"
                        >
                          <span className="block font-medium leading-6 text-zinc-900">
                            {cleanLessonText(lesson.topics)}
                          </span>
                          {lesson.topic_tags && lesson.topic_tags.length > 0 ? (
                            <span className="mt-2 flex flex-wrap gap-1.5">
                              {lesson.topic_tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 align-middle text-zinc-900">
                        <Link
                          href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
                          className="block text-zinc-900 underline-offset-4 hover:underline"
                        >
                          {formatCurrencyFromMinorUnits(lesson.fee_pence, currencyCode)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 align-middle">
                        <Link href={`/app/students/${studentId}/lessons/${lesson.id}/view`} className="block">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getPaymentStatusClassName(paymentStatus)}`}
                          >
                            {getPaymentStatusLabel(paymentStatus)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-4 pr-4 align-middle">
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-nowrap sm:items-center">
                          <Link
                            href={`/app/students/${studentId}/lessons/${lesson.id}/view`}
                            className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                          >
                            View notes
                          </Link>
                          {!readOnly ? (
                            <LessonPaidToggle lessonId={lesson.id} status={paymentStatus} compact />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
