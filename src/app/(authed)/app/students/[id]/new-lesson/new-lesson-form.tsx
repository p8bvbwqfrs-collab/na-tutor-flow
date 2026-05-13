"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyFromMinorUnits, getCurrencyLabel, type SupportedCurrencyCode } from "@/lib/currency";
import { getCompletedLessonUpdateStorageKey } from "@/lib/lesson-completion";
import { formatParentUpdate } from "@/lib/parent-update";
import {
  getPaymentStatusLabel,
  type LessonPaymentStatus,
} from "@/lib/payments";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { applyAvailableCreditToLesson, payOutstandingLessonAmount } from "../../../payment-actions";
import { DeleteLessonButton } from "../components/delete-lesson-button";
import { LessonFormSection } from "../components/lesson-form-section";
import { LessonSuccessPanel } from "../components/lesson-success-panel";
import { RatingSelector } from "../components/rating-selector";

type LessonFormProps = {
  studentId: string;
  studentName: string;
  mode?: "create" | "edit";
  lessonId?: string;
  saveStatus?: "completed" | "planned" | "cancelled";
  completionMode?: boolean;
  currencyCode?: SupportedCurrencyCode;
  initialLesson?: {
    lessonAt: string;
    topics: string;
    topicTags: string[];
    wentWell: string;
    parentNote: string;
    improve: string;
    homework: string;
    effort: number;
    confidence: number;
    feeAmount: string;
    paid: boolean;
    paymentStatus?: LessonPaymentStatus;
    availableCreditPence?: number;
    outstandingPence?: number;
    nextLesson?: {
      id: string;
      lessonAt: string;
      topics: string;
    } | null;
  };
};

type SavedLessonState = {
  lessonAt: string;
  topics: string;
  wentWell: string;
  parentNote: string;
  improve: string;
  homework: string;
  effort: number;
  confidence: number;
  nextLessonAt?: string | null;
};

function parseTopicTags(input: string) {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

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

export function NewLessonForm({
  studentId,
  studentName,
  mode = "create",
  lessonId,
  saveStatus = "completed",
  completionMode = false,
  currencyCode = "GBP",
  initialLesson,
}: LessonFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const formErrorId = "new-lesson-form-error";
  const isEditMode = mode === "edit";
  const initialDate = initialLesson?.lessonAt ? new Date(initialLesson.lessonAt) : new Date();

  const [lessonDate, setLessonDate] = useState(getDateValue(initialDate));
  const [lessonTime, setLessonTime] = useState(getTimeValue(initialDate));
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [topicTagsInput, setTopicTagsInput] = useState(initialLesson?.topicTags.join(", ") ?? "");
  const [wentWell, setWentWell] = useState(initialLesson?.wentWell ?? "");
  const [parentNote, setParentNote] = useState(initialLesson?.parentNote ?? "");
  const [improve, setImprove] = useState(initialLesson?.improve ?? "");
  const [homework, setHomework] = useState(initialLesson?.homework ?? "");
  const initialNextLessonDate = initialLesson?.nextLesson?.lessonAt
    ? new Date(initialLesson.nextLesson.lessonAt)
    : null;
  const [nextLessonDate, setNextLessonDate] = useState(
    initialNextLessonDate ? getDateValue(initialNextLessonDate) : "",
  );
  const [nextLessonTime, setNextLessonTime] = useState(
    initialNextLessonDate ? getTimeValue(initialNextLessonDate) : "",
  );
  const [nextLessonTopics, setNextLessonTopics] = useState(
    initialLesson?.nextLesson?.topics === "Planned lesson" ? "" : initialLesson?.nextLesson?.topics ?? "",
  );
  const [effort, setEffort] = useState(String(initialLesson?.effort ?? 3));
  const [confidence, setConfidence] = useState(String(initialLesson?.confidence ?? 3));
  const [fee, setFee] = useState(initialLesson?.feeAmount ?? "0.00");
  const [paid, setPaid] = useState(initialLesson?.paid ?? false);
  const paymentStatus = initialLesson?.paymentStatus ?? "unpaid";
  const availableCreditPence = initialLesson?.availableCreditPence ?? 0;
  const outstandingPence = initialLesson?.outstandingPence ?? 0;
  const [useCreditOnSave, setUseCreditOnSave] = useState(false);
  const isAlreadyCovered = paymentStatus === "paid";
  const feePreviewValue = Number(fee);
  const feePreviewPence = Number.isFinite(feePreviewValue) ? Math.max(0, Math.round(feePreviewValue * 100)) : 0;
  const initialFeeValue = Number(initialLesson?.feeAmount ?? 0);
  const initialFeePence = Number.isFinite(initialFeeValue) ? Math.max(0, Math.round(initialFeeValue * 100)) : 0;
  const existingAllocatedPence = Math.max(0, initialFeePence - outstandingPence);
  const creditOutstandingPence = lessonId ? Math.max(0, feePreviewPence - existingAllocatedPence) : feePreviewPence;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLesson, setSavedLesson] = useState<SavedLessonState | null>(null);
  const [postSaveWarning, setPostSaveWarning] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPostSaveWarning(null);

    const trimmedTopics = topics.trim();
    const topicTags = parseTopicTags(topicTagsInput);
    const trimmedWentWell = wentWell.trim();
    const trimmedParentNote = parentNote.trim();
    const trimmedImprove = improve.trim();
    const trimmedHomework = homework.trim();
    const trimmedNextLessonTopics = nextLessonTopics.trim();
    const hasNextLessonInput = Boolean(nextLessonDate || nextLessonTime || trimmedNextLessonTopics);

    if (!lessonDate || !lessonTime) {
      setError("Lesson date and time is required.");
      return;
    }

    if (hasNextLessonInput && (!nextLessonDate || !nextLessonTime)) {
      setError("Add both the next lesson date and time, or leave the section blank.");
      return;
    }

    if (!trimmedTopics) {
      setError("What you covered is required.");
      return;
    }

    const effortValue = Number(effort);
    if (!Number.isInteger(effortValue) || effortValue < 1 || effortValue > 5) {
      setError("Student effort must be a whole number between 1 and 5.");
      return;
    }

    const confidenceValue = Number(confidence);
    if (!Number.isInteger(confidenceValue) || confidenceValue < 1 || confidenceValue > 5) {
      setError("Confidence must be a whole number between 1 and 5.");
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

    const feePence = Math.round(feeValue * 100);
    const lessonAtIso = new Date(`${lessonDate}T${lessonTime}`).toISOString();
    const nextLessonAtIso = hasNextLessonInput
      ? new Date(`${nextLessonDate}T${nextLessonTime}`).toISOString()
      : null;

    setIsSubmitting(true);

    const payload = {
      student_id: studentId,
      lesson_at: lessonAtIso,
      topics: trimmedTopics,
      topic_tags: topicTags.length > 0 ? topicTags : null,
      went_well: trimmedWentWell || null,
      parent_note: trimmedParentNote || null,
      improve: trimmedImprove || null,
      homework: trimmedHomework || null,
      effort: effortValue,
      confidence: confidenceValue,
      fee_pence: feePence,
      paid,
      status: saveStatus,
    };

    const lessonMutation = isEditMode
      ? await supabase.from("lessons").update(payload).eq("id", lessonId).select("id").single()
      : await supabase.from("lessons").insert(payload).select("id").single();

    const submitError = lessonMutation.error;

    setIsSubmitting(false);

    if (submitError) {
      setError(submitError.message || "We couldn’t save this lesson. Please try again.");
      return;
    }

    const savedLessonId = isEditMode ? lessonId : lessonMutation.data?.id;

    if (!savedLessonId) {
      setError("The lesson was saved, but we couldn’t finish the next step. Please refresh and try again.");
      return;
    }

    if (useCreditOnSave && feePence > 0) {
      const creditResult = await applyAvailableCreditToLesson(savedLessonId);

      if (!creditResult.ok) {
        setError(creditResult.error ?? "The lesson was saved, but the credit could not be used.");
        return;
      }
    }

    if (paid && feePence > 0) {
      const paymentResult = await payOutstandingLessonAmount(savedLessonId);

      if (!paymentResult.ok) {
        setError(paymentResult.error ?? "The lesson was saved, but the payment could not be recorded.");
        return;
      }
    }

    let nextLessonScheduled = false;
    let nextLessonSaveWarning: string | null = null;

    if (nextLessonAtIso) {
      const linkedNextLessonId = initialLesson?.nextLesson?.id ?? null;
      const nextLessonPayload = {
        student_id: studentId,
        lesson_at: nextLessonAtIso,
        topics: trimmedNextLessonTopics || "Planned lesson",
        effort: 3,
        confidence: 3,
        fee_pence: feePence,
        paid: false,
        status: "planned" as const,
      };

      const nextLessonMutation = linkedNextLessonId
        ? await supabase
            .from("lessons")
            .update(nextLessonPayload)
            .eq("id", linkedNextLessonId)
            .eq("status", "planned")
            .select("id")
            .single()
        : await supabase.from("lessons").insert(nextLessonPayload).select("id").single();

      if (nextLessonMutation.error) {
        nextLessonSaveWarning =
          "The lesson was saved, but we couldn’t schedule the next lesson. Please try again from the student page.";
        setPostSaveWarning(nextLessonSaveWarning);
      } else {
        const resolvedNextLessonId = linkedNextLessonId ?? nextLessonMutation.data?.id ?? null;

        if (!linkedNextLessonId && resolvedNextLessonId) {
          const { error: linkError } = await supabase
            .from("lessons")
            .update({ next_lesson_id: resolvedNextLessonId })
            .eq("id", savedLessonId);

          if (linkError) {
            nextLessonSaveWarning =
              "The lesson was saved, but we couldn’t link the next lesson. Please check it from the student page.";
            setPostSaveWarning(nextLessonSaveWarning);
          } else {
            nextLessonScheduled = true;
          }
        } else {
          nextLessonScheduled = true;
        }
      }
    }

    const nextSavedLesson = {
      lessonAt: lessonAtIso,
      topics: trimmedTopics,
      wentWell: trimmedWentWell,
      parentNote: trimmedParentNote,
      improve: trimmedImprove,
      homework: trimmedHomework,
      effort: effortValue,
      confidence: confidenceValue,
      nextLessonAt: nextLessonScheduled ? nextLessonAtIso : null,
    };

    if (completionMode && !nextLessonSaveWarning) {
      const parentUpdateMessage = formatParentUpdate(studentName, nextSavedLesson);
      window.sessionStorage.setItem(
        getCompletedLessonUpdateStorageKey(studentId),
        parentUpdateMessage,
      );
      router.push(`/app/students/${studentId}?lessonCompleted=1`);
      router.refresh();
      return;
    }

    setSavedLesson(nextSavedLesson);
  }

  const parentUpdate = savedLesson ? formatParentUpdate(studentName, savedLesson) : "";
  const successTitle = completionMode ? "Lesson completed" : isEditMode ? "Lesson updated" : "Lesson saved";
  const successCopy = completionMode
    ? "Share the update message while the lesson details are still fresh."
    : isEditMode
    ? "Share the refreshed update message before you head back to the student page."
    : "Share the update message while the lesson is still fresh.";

  if (savedLesson) {
    return (
      <LessonSuccessPanel
        title={successTitle}
        description={successCopy}
        updateMessage={parentUpdate}
        secondaryAction={{
          label: "Back to student",
          href: `/app/students/${studentId}`,
        }}
        tertiaryAction={
          !isEditMode
            ? {
                label: "View your lessons in the calendar",
                href: "/app/calendar",
              }
            : undefined
        }
        warning={postSaveWarning}
        error={error}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full min-w-0 max-w-full space-y-4 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="space-y-5">
        <LessonFormSection title="Lesson details">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
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

            <div className="min-w-0">
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

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="topics" className="block text-sm font-medium text-zinc-700">
                What you covered
              </label>
              <textarea
                id="topics"
                required
                rows={3}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? formErrorId : undefined}
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="topic_tags" className="block text-sm font-medium text-zinc-700">
                Topic tags (optional)
              </label>
              <input
                id="topic_tags"
                type="text"
                value={topicTagsInput}
                onChange={(event) => setTopicTagsInput(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
                placeholder="e.g. algebra, fractions, exam practice"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Add a few short tags to make summaries and lesson history easier to scan.
              </p>
            </div>
          </div>
        </LessonFormSection>

        <LessonFormSection title="Reflection">
          <div className="grid min-w-0 gap-3">
            <div className="min-w-0">
              <label htmlFor="went_well" className="block text-sm font-medium text-zinc-700">
                What went well
              </label>
              <textarea
                id="went_well"
                rows={2}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? formErrorId : undefined}
                value={wentWell}
                onChange={(event) => setWentWell(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="improve" className="block text-sm font-medium text-zinc-700">
                Area to improve
              </label>
              <textarea
                id="improve"
                rows={2}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? formErrorId : undefined}
                value={improve}
                onChange={(event) => setImprove(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="homework" className="block text-sm font-medium text-zinc-700">
                Homework
              </label>
              <textarea
                id="homework"
                rows={2}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? formErrorId : undefined}
                value={homework}
                onChange={(event) => setHomework(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="parent_note" className="block text-sm font-medium text-zinc-700">
                Quick note for contact (optional)
              </label>
              <textarea
                id="parent_note"
                rows={3}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? formErrorId : undefined}
                value={parentNote}
                onChange={(event) => setParentNote(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
                placeholder="Anything helpful or encouraging you want the contact to know?"
              />
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <RatingSelector
                id="effort"
                label="Student effort"
                value={effort}
                helperText="How engaged and focused was the student in this lesson?"
                onChange={setEffort}
              />

              <RatingSelector
                id="confidence"
                label="Confidence"
                value={confidence}
                helperText="How confident did the student feel by the end of the lesson?"
                onChange={setConfidence}
              />
            </div>
          </div>
        </LessonFormSection>

        <LessonFormSection title="Admin and next steps">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
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
              <p className="mt-1 text-xs text-zinc-500">
                {isEditMode
                  ? "Update the fee if this lesson changed."
                  : "Pre-filled from the most recent lesson for this student."}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3">
              {isAlreadyCovered ? (
                <>
                  <p className="text-sm font-medium text-zinc-900">Payment: Paid / covered</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    This lesson is already covered by a recorded payment.
                  </p>
                </>
              ) : (
                <>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                    <input
                      type="checkbox"
                      checked={paid}
                      onChange={(event) => setPaid(event.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    />
                    Paid now
                  </label>
                  <p className="mt-1 text-xs text-zinc-600">
                    {paid
                      ? "Record a payment for the outstanding amount."
                      : paymentStatus === "part-paid"
                        ? `Payment: ${getPaymentStatusLabel(paymentStatus)}. Leave unticked to keep the remaining amount unpaid.`
                        : "Leave unticked to keep this lesson unpaid."}
                  </p>
                  {availableCreditPence > 0 && creditOutstandingPence > 0 ? (
                    <div className="mt-3 rounded-md border border-emerald-200 bg-white p-3">
                      <p className="text-xs text-zinc-600">
                        Credit available: {formatCurrencyFromMinorUnits(availableCreditPence, currencyCode)}
                      </p>
                      <label className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-900">
                        <input
                          type="checkbox"
                          checked={useCreditOnSave}
                          onChange={(event) => setUseCreditOnSave(event.target.checked)}
                          className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        />
                        Use available credit for this lesson
                      </label>
                      <p className="mt-1 text-xs text-zinc-600">Use money already recorded for this student.</p>
                      {availableCreditPence < creditOutstandingPence ? (
                        <p className="mt-2 text-xs text-zinc-600">
                          Remaining after credit:{" "}
                          {formatCurrencyFromMinorUnits(creditOutstandingPence - availableCreditPence, currencyCode)} unpaid.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4 sm:col-span-2">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">Schedule next lesson (optional)</h3>
                <p className="mt-1 text-sm text-zinc-600">
                Add the next session now so it appears in your calendar and upcoming lessons.
                </p>
              </div>

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="next_lesson_date" className="block text-sm font-medium text-zinc-700">
                  Next lesson date
                </label>
                <input
                  id="next_lesson_date"
                  type="date"
                  value={nextLessonDate}
                  onChange={(event) => setNextLessonDate(event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="next_lesson_time" className="block text-sm font-medium text-zinc-700">
                  Next lesson time
                </label>
                <input
                  id="next_lesson_time"
                  type="time"
                  value={nextLessonTime}
                  onChange={(event) => setNextLessonTime(event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label htmlFor="next_lesson_topics" className="block text-sm font-medium text-zinc-700">
                  Next lesson topic or note (optional)
                </label>
                <textarea
                  id="next_lesson_topics"
                  rows={2}
                  value={nextLessonTopics}
                  onChange={(event) => setNextLessonTopics(event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  placeholder={`What do you want to cover with ${studentName} next time?`}
                />
              </div>
              </div>
            </div>
          </div>
        </LessonFormSection>
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

      <div className={`grid min-w-0 gap-3 ${isEditMode && lessonId && !completionMode ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update lesson" : "Save lesson"}
        </button>
        <Link
          href={`/app/students/${studentId}`}
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel
        </Link>
        {isEditMode && lessonId && !completionMode ? (
          <DeleteLessonButton lessonId={lessonId} studentId={studentId} />
        ) : null}
      </div>
    </form>
  );
}
