"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { formatShortDateLocal } from "@/lib/datetime";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LessonFormProps = {
  studentId: string;
  studentName: string;
  mode?: "create" | "edit";
  lessonId?: string;
  saveStatus?: "completed" | "planned" | "cancelled";
  completionMode?: boolean;
  initialLesson?: {
    lessonAt: string;
    topics: string;
    topicTags: string[];
    wentWell: string;
    improve: string;
    homework: string;
    effort: number;
    confidence: number;
    feeGbp: string;
    paid: boolean;
  };
};

type SavedLessonState = {
  lessonAt: string;
  topics: string;
  wentWell: string;
  improve: string;
  homework: string;
  effort: number;
  confidence: number;
};

function splitIntoBulletPoints(input: string) {
  return input
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*;\s*/))
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

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

function formatParentUpdate(studentName: string, lesson: SavedLessonState) {
  const dateText = formatShortDateLocal(lesson.lessonAt);

  const focusPoints = splitIntoBulletPoints(lesson.topics);
  const wentWellPoints = splitIntoBulletPoints(lesson.wentWell);
  const improvePoints = splitIntoBulletPoints(lesson.improve);
  const homeworkPoints = splitIntoBulletPoints(lesson.homework);
  const lines = [`${studentName} – lesson update (${dateText})`];

  if (focusPoints.length > 0) {
    lines.push("", "Focus today", ...focusPoints.map((point) => `• ${point}`));
  }

  if (wentWellPoints.length > 0) {
    lines.push("", "What went well", ...wentWellPoints.map((point) => `• ${point}`));
  }

  if (improvePoints.length > 0) {
    lines.push("", "Area to improve", ...improvePoints.map((point) => `• ${point}`));
  }

  if (homeworkPoints.length > 0) {
    lines.push("", "Homework", ...homeworkPoints.map((point) => `• ${point}`));
  }

  lines.push("", `Student effort: ${lesson.effort}/5`, `Confidence: ${lesson.confidence}/5`);

  return lines.join("\n");
}

export function NewLessonForm({
  studentId,
  studentName,
  mode = "create",
  lessonId,
  saveStatus = "completed",
  completionMode = false,
  initialLesson,
}: LessonFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const formErrorId = "new-lesson-form-error";
  const isEditMode = mode === "edit";

  const [lessonAt, setLessonAt] = useState(
    initialLesson?.lessonAt ? toDatetimeLocalValue(new Date(initialLesson.lessonAt)) : toDatetimeLocalValue(new Date()),
  );
  const [topics, setTopics] = useState(initialLesson?.topics ?? "");
  const [topicTagsInput, setTopicTagsInput] = useState(initialLesson?.topicTags.join(", ") ?? "");
  const [wentWell, setWentWell] = useState(initialLesson?.wentWell ?? "");
  const [improve, setImprove] = useState(initialLesson?.improve ?? "");
  const [homework, setHomework] = useState(initialLesson?.homework ?? "");
  const [effort, setEffort] = useState(String(initialLesson?.effort ?? 3));
  const [confidence, setConfidence] = useState(String(initialLesson?.confidence ?? 3));
  const [fee, setFee] = useState(initialLesson?.feeGbp ?? "0.00");
  const [paid, setPaid] = useState(initialLesson?.paid ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLesson, setSavedLesson] = useState<SavedLessonState | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCopied(false);
    setShared(false);

    const trimmedTopics = topics.trim();
    const topicTags = parseTopicTags(topicTagsInput);
    const trimmedWentWell = wentWell.trim();
    const trimmedImprove = improve.trim();
    const trimmedHomework = homework.trim();

    if (!lessonAt) {
      setError("Lesson date and time is required.");
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

    setIsSubmitting(true);

    const payload = {
      student_id: studentId,
      lesson_at: new Date(lessonAt).toISOString(),
      topics: trimmedTopics,
      topic_tags: topicTags.length > 0 ? topicTags : null,
      went_well: trimmedWentWell || null,
      improve: trimmedImprove || null,
      homework: trimmedHomework || null,
      effort: effortValue,
      confidence: confidenceValue,
      fee_pence: feePence,
      paid,
      status: saveStatus,
    };

    const { error: submitError } = isEditMode
      ? await supabase.from("lessons").update(payload).eq("id", lessonId)
      : await supabase.from("lessons").insert(payload);

    setIsSubmitting(false);

    if (submitError) {
      setError(submitError.message || "We couldn’t save this lesson. Please try again.");
      return;
    }

    setSavedLesson({
      lessonAt,
      topics: trimmedTopics,
      wentWell: trimmedWentWell,
      improve: trimmedImprove,
      homework: trimmedHomework,
      effort: effortValue,
      confidence: confidenceValue,
    });
  }

  async function onCopyWhatsApp() {
    if (!savedLesson) {
      return;
    }

    const message = formatParentUpdate(studentName, savedLesson);

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setShared(false);
    } catch {
      setError("We couldn’t copy the update. Please copy it manually.");
    }
  }

  async function onShareUpdate() {
    if (!savedLesson) {
      return;
    }

    const message = formatParentUpdate(studentName, savedLesson);

    if (typeof navigator === "undefined" || !navigator.share) {
      setError("Sharing isn’t available on this device. Please copy the update instead.");
      return;
    }

    try {
      await navigator.share({
        title: `${studentName} lesson update`,
        text: message,
      });
      setShared(true);
      setCopied(false);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }

      setError("We couldn’t open the share sheet. Please copy the update instead.");
    }
  }

  const parentUpdate = savedLesson ? formatParentUpdate(studentName, savedLesson) : "";
  const successTitle = completionMode ? "Lesson completed" : isEditMode ? "Lesson updated" : "Lesson saved";
  const successCopy = completionMode
    ? "Share or copy the parent update while the lesson details are still fresh."
    : isEditMode
    ? "Share or copy the refreshed parent update before you head back to the student page."
    : "Share or copy the parent update while the lesson is still fresh.";

  if (savedLesson) {
    return (
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p role="status" className="text-base font-semibold text-emerald-900">
            {successTitle}
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            {successCopy}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onCopyWhatsApp}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Copy update
            </button>
            <button
              type="button"
              onClick={onShareUpdate}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Share update
            </button>
            <Link
              href={`/app/students/${studentId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Back to student
            </Link>
            {!isEditMode ? (
              <Link
                href="/app/calendar"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                View your lessons in the calendar
              </Link>
            ) : null}
          </div>
          <div className="mt-2 h-5">
            {copied ? <p className="text-sm font-medium text-emerald-700">Copied.</p> : null}
            {!copied && shared ? <p className="text-sm font-medium text-emerald-700">Shared.</p> : null}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-zinc-700">Parent update</h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            {parentUpdate}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
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

        <div>
          <label htmlFor="effort" className="block text-sm font-medium text-zinc-700">
            Student effort
          </label>
          <p className="mt-1 text-xs text-zinc-500">
            How engaged and focused was the student in this lesson?
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
            <span>1</span>
            <span>5</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <input
              id="effort"
              type="range"
              min={1}
              max={5}
              step={1}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? formErrorId : undefined}
              value={effort}
              onChange={(event) => setEffort(event.target.value)}
              className="w-full accent-zinc-800"
            />
            <span className="inline-flex min-w-9 justify-center rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-sm font-medium text-zinc-900">
              {effort}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="confidence" className="block text-sm font-medium text-zinc-700">
            Confidence
          </label>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
            <span>1</span>
            <span>5</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <input
              id="confidence"
              type="range"
              min={1}
              max={5}
              step={1}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? formErrorId : undefined}
              value={confidence}
              onChange={(event) => setConfidence(event.target.value)}
              className="w-full accent-zinc-800"
            />
            <span className="inline-flex min-w-9 justify-center rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-sm font-medium text-zinc-900">
              {confidence}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-zinc-700">
            Fee (GBP)
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

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
            <input
              type="checkbox"
              checked={paid}
              onChange={(event) => setPaid(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            Mark lesson as paid
          </label>
          <p className="mt-1 text-xs text-zinc-600">
            {paid ? "This lesson will be saved as paid." : "This lesson will be saved as unpaid."}
          </p>
        </div>
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
          {isSubmitting ? "Saving..." : isEditMode ? "Update lesson" : "Save lesson"}
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
