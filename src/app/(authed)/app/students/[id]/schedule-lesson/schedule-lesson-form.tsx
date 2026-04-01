"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ScheduleLessonFormProps = {
  studentId: string;
  studentName: string;
  mode?: "create" | "edit";
  lessonId?: string;
  initialLesson?: {
    lessonAt: string;
    topics: string;
  };
};

function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function getDateValue(date: Date) {
  return toDatetimeLocalValue(date).slice(0, 10);
}

function getTimeValue(date: Date) {
  return toDatetimeLocalValue(date).slice(11, 16);
}

export function ScheduleLessonForm({
  studentId,
  studentName,
  mode = "create",
  lessonId,
  initialLesson,
}: ScheduleLessonFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const isEditMode = mode === "edit";
  const formErrorId = "schedule-lesson-form-error";
  const initialDate = initialLesson?.lessonAt ? new Date(initialLesson.lessonAt) : new Date();
  const [lessonDate, setLessonDate] = useState(getDateValue(initialDate));
  const [lessonTime, setLessonTime] = useState(getTimeValue(initialDate));
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!lessonDate || !lessonTime) {
      setError("Lesson date and time is required.");
      return;
    }

    setIsSubmitting(true);

    const trimmedTopics = topics.trim();
    const lessonAt = new Date(`${lessonDate}T${lessonTime}`);

    const payload = {
      student_id: studentId,
      lesson_at: lessonAt.toISOString(),
      topics: trimmedTopics || "Planned lesson",
      effort: 3,
      confidence: 3,
      fee_pence: 0,
      paid: false,
      status: "planned",
    };

    const { error: submitError } = isEditMode
      ? await supabase.from("lessons").update(payload).eq("id", lessonId)
      : await supabase.from("lessons").insert(payload);

    setIsSubmitting(false);

    if (submitError) {
      setError(submitError.message || "We couldn’t save this scheduled lesson. Please try again.");
      return;
    }

    setSaved(true);
  }

  if (saved) {
    return (
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p role="status" className="text-base font-semibold text-emerald-900">
            {isEditMode ? "Scheduled lesson updated" : "Lesson scheduled"}
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            {isEditMode
              ? "The lesson details have been updated."
              : "The lesson now appears in the calendar and upcoming lessons."}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/app/students/${studentId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Back to student
            </Link>
            <Link
              href="/app/calendar"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              View calendar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lesson_date" className="block text-sm font-medium text-zinc-700">
            Lesson date
          </label>
          <input
            id="lesson_date"
            type="date"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? formErrorId : undefined}
            value={lessonDate}
            onChange={(event) => setLessonDate(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
          />
        </div>

        <div>
          <label htmlFor="lesson_time" className="block text-sm font-medium text-zinc-700">
            Lesson time
          </label>
          <input
            id="lesson_time"
            type="time"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? formErrorId : undefined}
            value={lessonTime}
            onChange={(event) => setLessonTime(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
          />
        </div>
      </div>

      <div>
        <label htmlFor="topics" className="block text-sm font-medium text-zinc-700">
          Planned topic or note (optional)
        </label>
        <textarea
          id="topics"
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={topics}
          onChange={(event) => setTopics(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
          placeholder={`What do you want to cover with ${studentName}?`}
        />
      </div>

      {error ? (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {isEditMode && lessonId ? (
          <Link
            href={`/app/students/${studentId}/lessons/${lessonId}?mode=complete`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Complete lesson
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-500"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update scheduled lesson" : "Schedule lesson"}
        </button>
        <Link
          href={`/app/students/${studentId}`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
