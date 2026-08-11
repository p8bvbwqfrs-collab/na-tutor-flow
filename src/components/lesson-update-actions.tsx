"use client";

import { useState } from "react";
import { trackActivationStep } from "@/lib/product-analytics";

type LessonUpdateActionsProps = {
  message: string;
  className?: string;
  buttonClassName?: string;
  reserveFeedbackSpace?: boolean;
};

export function LessonUpdateActions({
  message,
  className = "",
  buttonClassName = "inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
  reserveFeedbackSpace = true,
}: LessonUpdateActionsProps) {
  const [shared, setShared] = useState(false);
  const [copiedFallback, setCopiedFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyFallback() {
    try {
      await navigator.clipboard.writeText(message);
      setShared(false);
      setCopiedFallback(true);
      setError(null);
      trackActivationStep("parent_update_shared");
      window.setTimeout(() => setCopiedFallback(false), 2200);
    } catch {
      setShared(false);
      setCopiedFallback(false);
      setError("Sharing isn’t available and we couldn’t copy the update.");
    }
  }

  async function onShare() {
    if (!navigator.share) {
      await copyFallback();
      return;
    }

    try {
      await navigator.share({
        title: "Lesson update",
        text: message,
      });
      setShared(true);
      setCopiedFallback(false);
      setError(null);
      trackActivationStep("parent_update_shared");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }

      await copyFallback();
    }
  }

  const feedback = shared || copiedFallback || error;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onShare}
        className={buttonClassName}
      >
        Share update
      </button>
      {reserveFeedbackSpace || feedback ? (
        <div className={reserveFeedbackSpace ? "min-h-5" : ""}>
          {shared ? <p className="mt-1 text-xs text-emerald-700">Shared.</p> : null}
          {!shared && copiedFallback ? (
            <p className="mt-1 text-xs text-emerald-700">Sharing unavailable, copied update.</p>
          ) : null}
          {!shared && !copiedFallback && error ? <p className="mt-1 text-xs text-rose-800">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
