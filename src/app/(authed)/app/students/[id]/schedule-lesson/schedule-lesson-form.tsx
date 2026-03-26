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
  const [lessonAt, setLessonAt] = useState(
    initialLesson?.lessonAt
      ? toDatetimeLocalValue(new Date(initialLesson.lessonAt))
      : toDatetimeLocalValue(new Date()),
  );
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!lessonAt) {
      setError("Lesson date and time is required.");
      return;
    }

    setIsSubmitting(true);

    const trimmedTopics = topics.trim();
    const payload = {
      student_id: studentId,
      lesson_at: new Date(lessonAt).toISOString(),
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
      <div>
        <label htmlFor="lesson_at" className="block text-sm font-medium text-zinc-700">
          Lesson date and time
        </label>
        <input
          id="lesson_at"
          type="datetime-local"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={lessonAt}
          onChange={(event) => setLessonAt(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update scheduled lesson" : "Schedule lesson"}
        </button>
        <Link
          href={`/app/students/${studentId}`}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
