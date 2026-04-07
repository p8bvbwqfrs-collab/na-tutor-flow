"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDayHeadingLocal, formatTimeLocal } from "@/lib/datetime";

type CalendarGridLesson = {
  id: string;
  studentId: string;
  lessonAt: string;
  topics: string;
  status: "planned" | "completed" | "cancelled" | null;
  studentName: string;
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
};

function getStatusLabel(status: CalendarGridLesson["status"]) {
  return status === "planned" ? "Planned" : "Completed";
}

function getCompactMobileLabel(lesson: CalendarGridLesson) {
  const firstName = lesson.studentName.split(" ")[0] ?? lesson.studentName;
  return `${formatTimeLocal(lesson.lessonAt)} ${firstName}`.trim();
}

export function CalendarGrid({
  monthCells,
  weekdayLabels,
  lessons,
  todayKey,
}: CalendarGridProps) {
  const lessonsByDate = useMemo(() => {
    const buckets = new Map<string, CalendarGridLesson[]>();

    lessons.forEach((lesson) => {
      const dateKey = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Europe/London",
      }).format(new Date(lesson.lessonAt));
      const existing = buckets.get(dateKey) ?? [];
      existing.push(lesson);
      buckets.set(dateKey, existing);
    });

    return buckets;
  }, [lessons]);

  const firstInMonthKey = monthCells.find((cell) => cell.inMonth)?.key ?? monthCells[0]?.key ?? "";
  const initialSelectedDayKey = monthCells.some((cell) => cell.key === todayKey && cell.inMonth)
    ? todayKey
    : firstInMonthKey;
  const [selectedDayKey, setSelectedDayKey] = useState(initialSelectedDayKey);

  const selectedCell =
    monthCells.find((cell) => cell.key === selectedDayKey) ??
    monthCells.find((cell) => cell.inMonth) ??
    null;
  const selectedLessons = selectedCell ? lessonsByDate.get(selectedCell.key) ?? [] : [];

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
          const mobileVisibleLessons = dayLessons.slice(0, 1);
          const desktopVisibleLessons = dayLessons.slice(0, 2);
          const hasLessons = dayLessons.length > 0;
          const containerTone = isSelected
            ? "border-zinc-400 bg-zinc-100"
            : isToday
              ? "border-zinc-400 bg-zinc-100"
              : hasLessons && cell.inMonth
                ? "border-zinc-300 bg-zinc-50"
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
                className="block w-full text-left sm:hidden"
              >
                <span
                  className={`block text-xs font-medium ${
                    isToday || isSelected
                      ? "text-zinc-900"
                      : cell.inMonth
                        ? "text-zinc-700"
                        : "text-zinc-400"
                  }`}
                >
                  {cell.dayNumber}
                </span>
                <div className="mt-1.5 space-y-1">
                  {mobileVisibleLessons.map((lesson) => (
                    <span
                      key={lesson.id}
                      className={`block rounded-md border px-1.5 py-1 text-left ${
                        lesson.status === "planned"
                          ? "border-sky-100 bg-sky-50/70"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <span
                        className={`block truncate text-xs font-medium ${
                          lesson.status === "planned" ? "text-sky-900" : "text-zinc-900"
                        }`}
                      >
                        {getCompactMobileLabel(lesson)}
                      </span>
                    </span>
                  ))}
                  {dayLessons.length > 1 ? (
                    <p className="px-0.5 text-[11px] text-zinc-500">+{dayLessons.length - 1}</p>
                  ) : null}
                </div>
              </button>

              <div className="hidden sm:block">
                <p
                  className={`text-xs font-medium ${
                    isToday || isSelected
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
                      href={`/app/students/${lesson.studentId}/lessons/${lesson.id}`}
                      className={`block rounded-md border px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                        lesson.status === "planned"
                          ? "border-sky-100 bg-sky-50/70 hover:border-sky-200 hover:bg-sky-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <p
                        className={`truncate text-xs font-medium ${
                          lesson.status === "planned" ? "text-sky-900" : "text-zinc-900"
                        }`}
                      >
                        {lesson.studentName}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          lesson.status === "planned" ? "text-sky-800" : "text-zinc-600"
                        }`}
                      >
                        {formatTimeLocal(lesson.lessonAt)}
                      </p>
                      {lesson.status === "planned" ? (
                        <p className="mt-0.5 truncate text-xs text-sky-700">
                          {lesson.topics && lesson.topics !== "Planned lesson"
                            ? lesson.topics
                            : "Planned lesson"}
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
            {formatDayHeadingLocal(selectedCell.dateIso)}
          </h3>

          {selectedLessons.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No lessons on this day</p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedLessons.map((lesson) => {
                return (
                  <Link
                    key={lesson.id}
                    href={`/app/students/${lesson.studentId}/lessons/${lesson.id}`}
                    className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-nowrap text-sm font-medium text-zinc-900">
                        {formatTimeLocal(lesson.lessonAt)}
                      </p>
                      <p className="min-w-0 text-right text-sm font-medium text-zinc-900">
                        {lesson.studentName}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{getStatusLabel(lesson.status)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
