"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDayHeadingLocal, formatTimeLocal, getDateKeyLocal } from "@/lib/datetime";
import {
  getPlannedLessonAttentionLabel,
  type PlannedLessonAttention,
} from "@/lib/lesson-attention";
import {
  getLessonStatusClassName,
  getLessonStatusLabel,
} from "@/lib/status-styles";
import { PlannedLessonStatusButton } from "../students/[id]/components/planned-lesson-status-button";

type CalendarGridLesson = {
  id: string;
  studentId: string;
  lessonAt: string;
  topics: string;
  status: "planned" | "completed" | "cancelled" | null;
  studentName: string;
  attention: PlannedLessonAttention | null;
  readOnly: boolean;
};

type CalendarGridCell = {
  key: string;
  dateIso: string;
  inMonth: boolean;
  dayNumber: string;
};

type CalendarGridProps = {
  monthCells: CalendarGridCell[];
  weekdayLabels: string[];
  lessons: CalendarGridLesson[];
  todayKey: string;
  timeZone: string;
};

export function CalendarGrid({
  monthCells,
  weekdayLabels,
  lessons,
  todayKey,
  timeZone,
}: CalendarGridProps) {
  const lessonsByDate = useMemo(() => {
    const buckets = new Map<string, CalendarGridLesson[]>();

    lessons.forEach((lesson) => {
      const dateKey = getDateKeyLocal(lesson.lessonAt, timeZone);
      const existing = buckets.get(dateKey) ?? [];
      existing.push(lesson);
      buckets.set(dateKey, existing);
    });

    return buckets;
  }, [lessons, timeZone]);
  const selectedLessonsByKey = useMemo(() => lessonsByDate, [lessonsByDate]);

  const firstInMonthKey = monthCells.find((cell) => cell.inMonth)?.key ?? monthCells[0]?.key ?? "";
  const initialSelectedDayKey = monthCells.some((cell) => cell.key === todayKey && cell.inMonth)
    ? todayKey
    : firstInMonthKey;
  const [selectedDayKey, setSelectedDayKey] = useState(initialSelectedDayKey);

  const selectedCell =
    monthCells.find((cell) => cell.key === selectedDayKey) ??
    monthCells.find((cell) => cell.inMonth) ??
    null;
  const selectedLessons = selectedCell ? selectedLessonsByKey.get(selectedCell.key) ?? [] : [];

  return (
    <>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {monthCells.map((cell) => {
          const dayLessons = lessonsByDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDayKey;
          const desktopVisibleLessons = dayLessons.slice(0, 2);
          const hasLessons = dayLessons.length > 0;
          const containerTone = isSelected
            ? "border-zinc-500 bg-zinc-100"
            : isToday
              ? "border-zinc-400 bg-zinc-100"
              : hasLessons && cell.inMonth
                ? "border-zinc-300 bg-zinc-100/60"
              : cell.inMonth
                ? "border-zinc-200 bg-zinc-50"
                : "border-zinc-100 bg-white text-zinc-400";

          return (
            <div
              key={cell.key}
              className={`min-h-[4.5rem] rounded-lg border p-1 sm:min-h-28 sm:p-2 ${containerTone}`}
            >
              <button
                type="button"
                onClick={() => setSelectedDayKey(cell.key)}
                className="block w-full cursor-pointer text-left sm:hidden"
              >
                <span
                  className={`block text-xs font-medium ${
                    isSelected
                      ? "font-semibold text-zinc-900"
                      : isToday
                        ? "text-zinc-900"
                        : cell.inMonth
                          ? "text-zinc-700"
                          : "text-zinc-400"
                  }`}
                >
                  {cell.dayNumber}
                </span>
                <div className="mt-2 flex min-h-4 items-center gap-1">
                  {hasLessons ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected
                          ? "bg-blue-700"
                          : dayLessons.some((lesson) => lesson.attention === "overdue")
                            ? "bg-amber-500"
                          : dayLessons.some((lesson) => lesson.status === "planned")
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                      }`}
                    />
                  ) : null}
                  {dayLessons.length > 0 ? (
                    <span className="text-[11px] font-medium text-zinc-500">
                      {dayLessons.length === 1 ? "1" : `+${dayLessons.length}`}
                    </span>
                  ) : null}
                </div>
              </button>

              <div className="hidden sm:block">
                <p
                  className={`text-xs font-medium ${
                    isSelected
                      ? "font-semibold text-zinc-900"
                      : isToday
                        ? "text-zinc-900"
                        : cell.inMonth
                        ? "text-zinc-700"
                        : "text-zinc-400"
                  }`}
                >
                  {cell.dayNumber}
                </p>
                <div className="mt-2 space-y-1.5">
                  {desktopVisibleLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={
                        lesson.status === "planned"
                          ? `/app/students/${lesson.studentId}/lessons/${lesson.id}`
                          : `/app/students/${lesson.studentId}/lessons/${lesson.id}/view`
                      }
                      className={`block rounded-md border px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                        lesson.attention === "overdue"
                          ? "border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50"
                          : lesson.status === "planned"
                          ? "border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-50"
                          : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      <p
                        className={`truncate text-xs font-medium ${
                          lesson.attention === "overdue"
                            ? "text-amber-950"
                            : lesson.status === "planned"
                              ? "text-blue-950"
                              : "text-emerald-950"
                        }`}
                      >
                        {lesson.studentName}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          lesson.attention === "overdue"
                            ? "text-amber-800"
                            : lesson.status === "planned"
                              ? "text-blue-800"
                              : "text-emerald-800"
                        }`}
                      >
                        {formatTimeLocal(lesson.lessonAt, timeZone)}
                      </p>
                      {lesson.status === "planned" && lesson.attention ? (
                        <p
                          className={`mt-0.5 truncate text-xs ${
                            lesson.attention === "overdue" ? "font-medium text-amber-800" : "text-blue-700"
                          }`}
                        >
                          {lesson.attention === "overdue"
                            ? getPlannedLessonAttentionLabel(lesson.attention)
                            : lesson.topics && lesson.topics !== "Planned lesson"
                              ? lesson.topics
                              : getPlannedLessonAttentionLabel(lesson.attention)}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                  {dayLessons.length > 2 ? (
                    <p className="px-1 text-xs text-zinc-500">+{dayLessons.length - 2} more</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCell ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="text-base font-medium text-zinc-900">
            Lessons on {formatDayHeadingLocal(selectedCell.dateIso, timeZone)}
          </h3>

          {selectedLessons.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No lessons on this day</p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedLessons.map((lesson) => {
                return (
                  <div
                    key={lesson.id}
                    className={`rounded-lg border p-3 ${
                      lesson.attention === "overdue"
                        ? "border-amber-200 bg-amber-50/80"
                        : lesson.status === "planned"
                          ? "border-blue-200 bg-blue-50/70"
                          : "border-emerald-200 bg-emerald-50/60"
                    }`}
                  >
                    <p className="text-sm font-medium text-zinc-900">
                      {formatTimeLocal(lesson.lessonAt, timeZone)} · {lesson.studentName}
                    </p>
                    {lesson.status === "planned" && lesson.attention ? (
                      <span
                        className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          lesson.attention === "overdue"
                            ? "border-amber-300 bg-amber-100 text-amber-900"
                            : "border-blue-200 bg-blue-50 text-blue-800"
                        }`}
                      >
                        {getPlannedLessonAttentionLabel(lesson.attention)}
                      </span>
                    ) : (
                      <span
                        className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getLessonStatusClassName(lesson.status)}`}
                      >
                        {getLessonStatusLabel(lesson.status)}
                      </span>
                    )}
                    {lesson.status === "planned" ? (
                      lesson.readOnly ? (
                        <p className="mt-3 text-xs font-medium text-zinc-600">Archived student · Read-only</p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                          <Link
                            href={`/app/students/${lesson.studentId}/lessons/${lesson.id}?mode=complete`}
                            className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                          >
                            Complete lesson
                          </Link>
                          <Link
                            href={`/app/students/${lesson.studentId}/lessons/${lesson.id}`}
                            className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                          >
                            Reschedule
                          </Link>
                          <PlannedLessonStatusButton
                            lessonId={lesson.id}
                            studentId={lesson.studentId}
                            nextStatus="cancelled"
                            label="Cancel lesson"
                            className="min-h-10 w-full border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                          />
                        </div>
                      )
                    ) : (
                      <Link
                        href={`/app/students/${lesson.studentId}/lessons/${lesson.id}/view`}
                        className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                      >
                        View notes
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
