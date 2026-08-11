"use client";

import { useMemo, useState } from "react";
import { formatMonthLocal, getMonthKeyLocal } from "@/lib/datetime";
import {
  buildMonthlyParentUpdate,
  type MonthlyParentUpdateLesson,
} from "@/lib/monthly-parent-update";

type MonthlySummaryGeneratorProps = {
  studentName: string;
  lessons: MonthlyParentUpdateLesson[];
  selectedMonthKey: string;
  timeZone: string;
  nextLessonAt?: string | null;
};

export function MonthlySummaryGenerator({
  studentName,
  lessons,
  selectedMonthKey,
  timeZone,
  nextLessonAt,
}: MonthlySummaryGeneratorProps) {
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const lessonsForMonth = useMemo(
    () =>
      lessons.filter(
        (lesson) => getMonthKeyLocal(lesson.lesson_at, timeZone) === selectedMonthKey,
      ),
    [lessons, selectedMonthKey, timeZone],
  );

  function generateSummary() {
    if (lessonsForMonth.length === 0) {
      setSummary("");
      setStatus("No completed lessons are available for this month.");
      return;
    }

    setSummary(
      buildMonthlyParentUpdate({
        studentName,
        monthKey: selectedMonthKey,
        lessons: lessonsForMonth,
        timeZone,
        nextLessonAt,
      }),
    );
    setCopied(false);
    setStatus("Update created from the recorded lesson details. Review it before sharing.");
  }

  async function onCopySummary() {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setStatus("Monthly parent update copied.");
    } catch {
      setCopied(false);
      setStatus("We couldn’t copy the update. Select the text and copy it manually.");
    }
  }

  const lessonLabel = `${lessonsForMonth.length} ${lessonsForMonth.length === 1 ? "lesson" : "lessons"}`;

  return (
    <details className="group rounded-lg border border-zinc-200 bg-zinc-50">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-zinc-900">Create monthly parent update</span>
          <span className="mt-0.5 block text-xs leading-5 text-zinc-600">
            {formatMonthLocal(selectedMonthKey)} · {lessonLabel} included
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-lg text-zinc-500 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-zinc-200 p-4">
        <p className="text-sm leading-6 text-zinc-600">
          Creates a concise draft using the recorded topics, strengths, next focus, homework and
          tutor ratings. Nothing is sent automatically, and you can edit every word.
        </p>
        <button
          type="button"
          onClick={generateSummary}
          disabled={lessonsForMonth.length === 0}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          {summary ? "Regenerate update" : "Create update"}
        </button>

        {summary ? (
          <div className="mt-4 space-y-3">
            <label htmlFor="monthly_parent_update" className="block text-sm font-medium text-zinc-900">
              Review and edit
            </label>
            <textarea
              id="monthly_parent_update"
              value={summary}
              onChange={(event) => {
                setSummary(event.target.value);
                setCopied(false);
                setStatus(null);
              }}
              rows={15}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <button
              type="button"
              onClick={onCopySummary}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              {copied ? "Copied" : "Copy update"}
            </button>
          </div>
        ) : null}

        <p className="mt-3 min-h-5 text-sm text-zinc-600" role="status" aria-live="polite">
          {status ?? (lessonsForMonth.length === 0 ? "Log a completed lesson to create an update." : "")}
        </p>
      </div>
    </details>
  );
}
