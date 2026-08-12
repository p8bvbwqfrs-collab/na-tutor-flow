"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { getCurrencyLabel, type SupportedCurrencyCode } from "@/lib/currency";
import { getTimeZoneLabel, getZonedDateTimeInputValues } from "@/lib/datetime";
import { getSubmittedLessonAtIsoFromForm } from "@/lib/lesson-scheduling";
import { createSubmissionGuard } from "@/lib/submission-guard";
import { verifyStudentIsActive } from "../../student-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { applyAvailableCreditToLesson } from "../../../payment-actions";
import { LessonFormSection } from "../components/lesson-form-section";

type ScheduleLessonFormProps = {
  studentId: string;
  studentName: string;
  mode?: "create" | "edit";
  lessonId?: string;
  initialLesson?: {
    lessonAt: string;
    topics: string;
    feeAmount: string;
  };
  currencyCode?: SupportedCurrencyCode;
  timeZone: string;
};

export function ScheduleLessonForm({
  studentId,
  studentName,
  mode = "create",
  lessonId,
  initialLesson,
  currencyCode = "GBP",
  timeZone,
}: ScheduleLessonFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const isEditMode = mode === "edit";
  const formErrorId = "schedule-lesson-form-error";
  const initialDate = initialLesson?.lessonAt ? new Date(initialLesson.lessonAt) : new Date();
  const initialDateTimeValues = getZonedDateTimeInputValues(initialDate, timeZone);
  const timeZoneLabel = getTimeZoneLabel(timeZone);
  const [lessonDate, setLessonDate] = useState(initialDateTimeValues.date);
  const [lessonTime, setLessonTime] = useState(initialDateTimeValues.time);
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [fee, setFee] = useState(initialLesson?.feeAmount ?? "0.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const submissionGuardRef = useRef(createSubmissionGuard());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWarning(null);

    if (!lessonDate || !lessonTime) {
      setError("Lesson date and time is required.");
      return;
    }

    if (!fee.trim()) {
      setError("Fee is required.");
      return;
    }

    const feeValue = Number(fee);
    if (!Number.isFinite(feeValue) || feeValue < 0) {
      setError("Fee must be a number greater than or equal to 0.");
      return;
    }

    let lessonAtIso: string;

    try {
      lessonAtIso = getSubmittedLessonAtIsoFromForm(event.currentTarget, timeZone);
    } catch (dateTimeError) {
      setError(
        dateTimeError instanceof Error ? dateTimeError.message : "Lesson date and time is invalid.",
      );
      return;
    }

    const submissionId = submissionGuardRef.current.acquire();
    if (!submissionId) return;

    setIsSubmitting(true);

    const activeStudent = await verifyStudentIsActive(studentId);

    if (!activeStudent.ok) {
      submissionGuardRef.current.release();
      setIsSubmitting(false);
      setError(activeStudent.error);
      return;
    }

    const trimmedTopics = topics.trim();

    const payload = {
      student_id: studentId,
      lesson_at: lessonAtIso,
      topics: trimmedTopics || "Planned lesson",
      effort: 3,
      confidence: 3,
      fee_pence: Math.round(feeValue * 100),
      paid: false,
      status: "planned",
    };

    const lessonMutation = isEditMode
      ? await supabase.from("lessons").update(payload).eq("id", lessonId).select("id").single()
      : await supabase.from("lessons").insert({ id: submissionId, ...payload }).select("id").single();

    if (lessonMutation.error || !lessonMutation.data?.id) {
      submissionGuardRef.current.release();
      setIsSubmitting(false);
      setError(lessonMutation.error?.message || "We couldn’t save this scheduled lesson. Please try again.");
      return;
    }

    if (payload.fee_pence > 0) {
      const creditResult = await applyAvailableCreditToLesson(lessonMutation.data.id);

      if (!creditResult.ok) {
        setWarning("The lesson was scheduled, but existing credit could not be applied automatically.");
      }
    }

    setIsSubmitting(false);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="w-full min-w-0 space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p role="status" className="text-base font-semibold text-emerald-900">
            {isEditMode ? "Scheduled lesson updated" : "Lesson scheduled"}
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            {isEditMode
              ? "The lesson details have been updated."
              : "The lesson now appears in the calendar and upcoming lessons."}
          </p>
          {warning ? (
            <p role="alert" className="mt-3 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900">
              {warning}
            </p>
          ) : null}
          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
            <Link
              href={`/app/students/${studentId}`}
              className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Back to student
            </Link>
            <Link
              href="/app/calendar"
              className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              View calendar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full min-w-0 max-w-full space-y-4 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4"
    >
      <LessonFormSection title="Lesson details">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="lesson_date" className="block text-sm font-medium text-zinc-700">
              Lesson date
            </label>
            <input
              id="lesson_date"
              name="lesson_date"
              type="date"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? formErrorId : undefined}
              value={lessonDate}
              onChange={(event) => setLessonDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="lesson_time" className="block text-sm font-medium text-zinc-700">
              Lesson time
            </label>
            <input
              id="lesson_time"
              name="lesson_time"
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
        <p className="text-xs leading-5 text-zinc-500">
          Times use {timeZoneLabel}.{" "}
          <Link href="/app/settings" className="font-medium underline underline-offset-2">
            Change time zone
          </Link>
        </p>

        <div className="min-w-0">
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

        <div className="min-w-0">
          <label htmlFor="fee" className="block text-sm font-medium text-zinc-700">
            {getCurrencyLabel(currencyCode)}
          </label>
          <input
            id="fee"
            type="number"
            min={0}
            step="0.01"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? formErrorId : undefined}
            value={fee}
            onChange={(event) => setFee(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            placeholder="50.00"
          />
        </div>
      </LessonFormSection>

      {error ? (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {error}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        {isEditMode && lessonId ? (
          <Link
            href={`/app/students/${studentId}/lessons/${lessonId}?mode=complete`}
            className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Complete lesson
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-500"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update scheduled lesson" : "Schedule lesson"}
        </button>
        <Link
          href={`/app/students/${studentId}`}
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-center text-sm text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel lesson
        </Link>
      </div>
    </form>
  );
}
