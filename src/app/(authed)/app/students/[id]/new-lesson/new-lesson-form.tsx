"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { formatCurrencyFromMinorUnits, getCurrencyLabel, type SupportedCurrencyCode } from "@/lib/currency";
import { getCompletedLessonUpdateStorageKey } from "@/lib/lesson-completion";
import {
  getTimeZoneLabel,
  getZonedDateTimeInputValues,
  zonedDateTimeToIso,
} from "@/lib/datetime";
import { formatParentUpdate } from "@/lib/parent-update";
import type { LessonPaymentStatus } from "@/lib/payments";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createSubmissionGuard } from "@/lib/submission-guard";
import { applyAvailableCreditToLesson, payOutstandingLessonAmount } from "../../../payment-actions";
import { DeleteLessonButton } from "../components/delete-lesson-button";
import { verifyStudentIsActive } from "../../student-actions";
import { LessonFormSection } from "../components/lesson-form-section";
import { LessonSuccessPanel } from "../components/lesson-success-panel";
import { trackActivationStep } from "@/lib/product-analytics";
import { RatingSelector } from "../components/rating-selector";

type LessonFormProps = {
  studentId: string;
  studentName: string;
  mode?: "create" | "edit";
  lessonId?: string;
  saveStatus?: "completed" | "planned" | "cancelled";
  completionMode?: boolean;
  currencyCode?: SupportedCurrencyCode;
  timeZone: string;
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

export function NewLessonForm({
  studentId,
  studentName,
  mode = "create",
  lessonId,
  saveStatus = "completed",
  completionMode = false,
  currencyCode = "GBP",
  timeZone,
  initialLesson,
}: LessonFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const formErrorId = "new-lesson-form-error";
  const isEditMode = mode === "edit";
  const initialDate = initialLesson?.lessonAt ? new Date(initialLesson.lessonAt) : new Date();
  const initialDateTime = getZonedDateTimeInputValues(initialDate, timeZone);
  const timeZoneLabel = getTimeZoneLabel(timeZone);

  const [lessonDate, setLessonDate] = useState(initialDateTime.date);
  const [lessonTime, setLessonTime] = useState(initialDateTime.time);
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [topicTagsInput, setTopicTagsInput] = useState(initialLesson?.topicTags.join(", ") ?? "");
  const [wentWell, setWentWell] = useState(initialLesson?.wentWell ?? "");
  const [parentNote, setParentNote] = useState(initialLesson?.parentNote ?? "");
  const [improve, setImprove] = useState(initialLesson?.improve ?? "");
  const [homework, setHomework] = useState(initialLesson?.homework ?? "");
  const initialNextLessonDate = initialLesson?.nextLesson?.lessonAt
    ? new Date(initialLesson.nextLesson.lessonAt)
    : null;
  const initialNextLessonDateTime = initialNextLessonDate
    ? getZonedDateTimeInputValues(initialNextLessonDate, timeZone)
    : null;
  const [nextLessonDate, setNextLessonDate] = useState(
    initialNextLessonDateTime?.date ?? "",
  );
  const [nextLessonTime, setNextLessonTime] = useState(
    initialNextLessonDateTime?.time ?? "",
  );
  const [nextLessonTopics, setNextLessonTopics] = useState(
    initialLesson?.nextLesson?.topics === "Planned lesson" ? "" : initialLesson?.nextLesson?.topics ?? "",
  );
  const [effort, setEffort] = useState(String(initialLesson?.effort ?? 3));
  const [confidence, setConfidence] = useState(String(initialLesson?.confidence ?? 3));
  const [fee, setFee] = useState(initialLesson?.feeAmount ?? "0.00");
  const [markPaidOnSave, setMarkPaidOnSave] = useState(false);
  const paymentStatus = initialLesson?.paymentStatus ?? "unpaid";
  const availableCreditPence = initialLesson?.availableCreditPence ?? 0;
  const outstandingPence = initialLesson?.outstandingPence ?? 0;
  const isAlreadyCovered = paymentStatus === "paid";
  const feePreviewValue = Number(fee);
  const feePreviewPence = Number.isFinite(feePreviewValue) ? Math.max(0, Math.round(feePreviewValue * 100)) : 0;
  const initialFeeValue = Number(initialLesson?.feeAmount ?? 0);
  const initialFeePence = Number.isFinite(initialFeeValue) ? Math.max(0, Math.round(initialFeeValue * 100)) : 0;
  const existingAllocatedPence = Math.max(0, initialFeePence - outstandingPence);
  const creditOutstandingPence = lessonId ? Math.max(0, feePreviewPence - existingAllocatedPence) : feePreviewPence;
  const shouldAutoApplyCredit = !isEditMode || completionMode || markPaidOnSave;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLesson, setSavedLesson] = useState<SavedLessonState | null>(null);
  const [postSaveWarning, setPostSaveWarning] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submissionGuardRef = useRef(createSubmissionGuard());
  const nextLessonDraftIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

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
    let lessonAtIso: string;
    let nextLessonAtIso: string | null;

    try {
      lessonAtIso = zonedDateTimeToIso(lessonDate, lessonTime, timeZone);
      nextLessonAtIso = hasNextLessonInput
        ? zonedDateTimeToIso(nextLessonDate, nextLessonTime, timeZone)
        : null;
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
      // Payment status is derived from payment allocations. Keep the legacy
      // column false so it cannot drift away from the payment ledger.
      paid: false,
      status: saveStatus,
    };

    const lessonMutation = isEditMode
      ? await supabase.from("lessons").update(payload).eq("id", lessonId).select("id").single()
      : await supabase.from("lessons").insert({ id: submissionId, ...payload }).select("id").single();

    const submitError = lessonMutation.error;

    if (submitError) {
      submissionGuardRef.current.release();
      setIsSubmitting(false);
      setError(submitError.message || "We couldn’t save this lesson. Please try again.");
      return;
    }

    const savedLessonId = isEditMode ? lessonId : lessonMutation.data?.id;

    if (!savedLessonId) {
      submissionGuardRef.current.release();
      setIsSubmitting(false);
      setError("The lesson was saved, but we couldn’t finish the next step. Please refresh and try again.");
      return;
    }

    if (!isEditMode) {
      trackActivationStep("lesson_logged");
    }

    const postSaveWarnings: string[] = [];

    if (markPaidOnSave && feePence > 0) {
      const paymentResult = await payOutstandingLessonAmount(savedLessonId);

      if (!paymentResult.ok) {
        postSaveWarnings.push(
          paymentResult.error ?? "The lesson was saved, but the payment could not be recorded.",
        );
      }
    } else if (shouldAutoApplyCredit && feePence > 0) {
      const creditResult = await applyAvailableCreditToLesson(savedLessonId);

      if (!creditResult.ok) {
        postSaveWarnings.push(
          creditResult.error ?? "The lesson was saved, but the credit could not be used.",
        );
      }
    }

    let nextLessonScheduled = false;

    if (nextLessonAtIso) {
      const linkedNextLessonId = initialLesson?.nextLesson?.id ?? null;
      const nextLessonDraftId = (nextLessonDraftIdRef.current ??= crypto.randomUUID());
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
        : await supabase
            .from("lessons")
            .insert({ id: nextLessonDraftId, ...nextLessonPayload })
            .select("id")
            .single();

      if (nextLessonMutation.error) {
        postSaveWarnings.push(
          "The lesson was saved, but we couldn’t schedule the next lesson. Please try again from the student page.",
        );
      } else {
        const resolvedNextLessonId = linkedNextLessonId ?? nextLessonMutation.data?.id ?? null;

        if (!linkedNextLessonId && resolvedNextLessonId) {
          const { error: linkError } = await supabase
            .from("lessons")
            .update({ next_lesson_id: resolvedNextLessonId })
            .eq("id", savedLessonId);

          if (linkError) {
            postSaveWarnings.push(
              "The lesson was saved, but we couldn’t link the next lesson. Please check it from the student page.",
            );
          } else {
            nextLessonScheduled = true;
          }
        } else {
          nextLessonScheduled = true;
        }

        if (resolvedNextLessonId && nextLessonScheduled) {
          const nextLessonCreditResult = await applyAvailableCreditToLesson(resolvedNextLessonId);

          if (!nextLessonCreditResult.ok) {
            postSaveWarnings.push(
              "Both lessons were saved, but existing credit could not be applied to the next lesson.",
            );
          }
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

    const postSaveWarning = postSaveWarnings.join(" ") || null;
    setPostSaveWarning(postSaveWarning);

    if (completionMode && !postSaveWarning) {
      const parentUpdateMessage = formatParentUpdate(studentName, nextSavedLesson, timeZone);
      window.sessionStorage.setItem(
        getCompletedLessonUpdateStorageKey(studentId),
        parentUpdateMessage,
      );
      window.location.replace(`/app/students/${studentId}?lessonCompleted=1`);
      return;
    }

    setIsSubmitting(false);
    setSavedLesson(nextSavedLesson);
  }

  const parentUpdate = savedLesson ? formatParentUpdate(studentName, savedLesson, timeZone) : "";
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

            <p className="text-xs leading-5 text-zinc-500 sm:col-span-2">
              Times use {timeZoneLabel}.{" "}
              <Link href="/app/settings" className="font-medium underline underline-offset-2">
                Change time zone
              </Link>
            </p>

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
                      checked={markPaidOnSave}
                      onChange={(event) => setMarkPaidOnSave(event.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    />
                    Mark this lesson as paid
                  </label>
                  <p className="mt-1 text-xs text-zinc-600">
                    {markPaidOnSave
                      ? "Existing credit will be used first, then any remaining amount will be recorded as received."
                      : "Leave unticked if payment has not been received yet."}
                  </p>
                  {availableCreditPence > 0 && creditOutstandingPence > 0 && shouldAutoApplyCredit ? (
                    <div className="mt-3 rounded-md border border-emerald-200 bg-white p-3">
                      <p className="text-sm font-medium text-emerald-900">
                        Existing credit will be applied automatically
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {formatCurrencyFromMinorUnits(
                          Math.min(availableCreditPence, creditOutstandingPence),
                          currencyCode,
                        )}{" "}
                        already received for this student will be used first.
                      </p>
                      {availableCreditPence < creditOutstandingPence ? (
                        <p className="mt-2 text-xs text-zinc-600">
                          {markPaidOnSave
                            ? `${formatCurrencyFromMinorUnits(
                                creditOutstandingPence - availableCreditPence,
                                currencyCode,
                              )} will be recorded as received when you save.`
                            : `${formatCurrencyFromMinorUnits(
                                creditOutstandingPence - availableCreditPence,
                                currencyCode,
                              )} will remain outstanding.`}
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
          ref={errorRef}
          id={formErrorId}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 outline-none"
        >
          {error}
        </p>
      ) : null}

      <div className={`grid min-w-0 gap-3 ${isEditMode && lessonId && !completionMode ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
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
