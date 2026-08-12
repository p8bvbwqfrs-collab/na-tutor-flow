"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmissionGuard } from "@/lib/submission-guard";
import { payOutstandingLessonAmount } from "../../payment-actions";

type MarkPaidButtonProps = {
  lessonId: string;
};

export function MarkPaidButton({ lessonId }: MarkPaidButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionGuardRef = useRef(createSubmissionGuard());

  async function onMarkPaid() {
    if (!submissionGuardRef.current.acquire()) return;

    setIsUpdating(true);
    setError(null);
    setMarked(true);

    const result = await payOutstandingLessonAmount(lessonId);

    setIsUpdating(false);

    if (!result.ok) {
      submissionGuardRef.current.release();
      setMarked(false);
      setError(result.error ?? "Could not record payment.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onMarkPaid}
        disabled={isUpdating || marked}
        className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-600 sm:w-auto"
      >
        {isUpdating ? "Saving..." : marked ? "Marked as paid" : "Mark as paid"}
      </button>
      {error ? <p role="alert" className="text-xs text-rose-900">{error}</p> : null}
    </div>
  );
}
