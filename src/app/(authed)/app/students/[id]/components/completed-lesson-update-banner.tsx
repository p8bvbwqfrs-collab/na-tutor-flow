"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompletedLessonUpdateStorageKey } from "@/lib/lesson-completion";

type CompletedLessonUpdateBannerProps = {
  studentId: string;
};

export function CompletedLessonUpdateBanner({
  studentId,
}: CompletedLessonUpdateBannerProps) {
  const storageKey = useMemo(() => getCompletedLessonUpdateStorageKey(studentId), [studentId]);
  const [parentUpdate, setParentUpdate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUpdate = window.sessionStorage.getItem(storageKey);
    if (savedUpdate) {
      setParentUpdate(savedUpdate);
    }
  }, [storageKey]);

  async function onCopyUpdate() {
    if (!parentUpdate) {
      return;
    }

    try {
      await navigator.clipboard.writeText(parentUpdate);
      setCopied(true);
      setShared(false);
      setError(null);
    } catch {
      setError("We couldn’t copy the update. Please copy it manually.");
    }
  }

  async function onShareUpdate() {
    if (!parentUpdate) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.share) {
      setError("Sharing isn’t available on this device. Please copy the update instead.");
      return;
    }

    try {
      await navigator.share({
        title: "Lesson update",
        text: parentUpdate,
      });
      setShared(true);
      setCopied(false);
      setError(null);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }

      setError("We couldn’t open the share sheet. Please copy the update instead.");
    }
  }

  function onDismiss() {
    window.sessionStorage.removeItem(storageKey);
    setParentUpdate(null);
    setCopied(false);
    setShared(false);
    setError(null);
  }

  if (!parentUpdate) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p role="status" className="text-base font-semibold text-emerald-900">
          Lesson completed
        </p>
        <p className="mt-1 text-sm text-emerald-900/80">
          The lesson is now saved on the student page. Copy or share the parent update from here.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onCopyUpdate}
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
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Dismiss
          </button>
        </div>
        <div className="mt-2 min-h-5">
          {copied ? <p className="text-sm font-medium text-emerald-700">Copied.</p> : null}
          {!copied && shared ? <p className="text-sm font-medium text-emerald-700">Shared.</p> : null}
          {!copied && !shared && error ? <p className="text-sm text-rose-800">{error}</p> : null}
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
