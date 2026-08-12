"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmissionGuard } from "@/lib/submission-guard";
import {
  getMarkLessonUnpaidConfirmation,
  markLessonUnpaid,
  payOutstandingLessonAmount,
} from "../../../payment-actions";

type LessonPaidToggleProps = {
  lessonId: string;
  status: "paid" | "part-paid" | "unpaid";
  compact?: boolean;
};

export function LessonPaidToggle({
  lessonId,
  status,
  compact = false,
}: LessonPaidToggleProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<typeof status | null>(null);
  const submissionGuardRef = useRef(createSubmissionGuard());

  async function onToggle() {
    if (submittedStatus && submittedStatus !== status) {
      setSubmittedStatus(null);
      submissionGuardRef.current.reset();
    }

    if (!submissionGuardRef.current.acquire()) return;

    setError(null);
    setIsUpdating(true);

    if (status === "paid") {
      const confirmation = await getMarkLessonUnpaidConfirmation(lessonId);
      const confirmed = window.confirm(
        confirmation.message ||
          "This will mark the lesson as unpaid. Any reusable payment credit will remain on the student account.",
      );

      if (!confirmed) {
        submissionGuardRef.current.release();
        setIsUpdating(false);
        return;
      }

      const result = await markLessonUnpaid(lessonId);

      if (!result.ok) {
        submissionGuardRef.current.release();
        setIsUpdating(false);
        setError(result.error ?? "Could not update.");
        return;
      }

      setSubmittedStatus(status);
      setIsUpdating(false);
      router.refresh();
      return;
    }

    const result = await payOutstandingLessonAmount(lessonId);

    if (!result.ok) {
      submissionGuardRef.current.release();
      setIsUpdating(false);
      setError(result.error ?? "Could not update.");
      return;
    }

    setSubmittedStatus(status);
    setIsUpdating(false);
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={isUpdating || submittedStatus === status}
        className={`inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 sm:w-auto ${
          status === "paid"
            ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
        }`}
      >
        {isUpdating ? "Saving..." : status === "paid" ? "Undo payment" : "Mark as paid"}
      </button>
      {compact ? (
        error ? <p className="text-xs text-rose-700">{error}</p> : null
      ) : (
        <div className="min-h-4">{error ? <p className="text-xs text-rose-700">{error}</p> : null}</div>
      )}
    </div>
  );
}
