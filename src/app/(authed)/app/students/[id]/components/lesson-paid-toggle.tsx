"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [paymentStatus, setPaymentStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPaymentStatus(status);
    setError(null);
  }, [status]);

  async function onToggle() {
    setError(null);
    setIsUpdating(true);

    if (paymentStatus === "paid") {
      const confirmation = await getMarkLessonUnpaidConfirmation(lessonId);
      const confirmed = window.confirm(
        confirmation.message ||
          "This will mark the lesson as unpaid. Any reusable payment credit will remain on the student account.",
      );

      if (!confirmed) {
        setIsUpdating(false);
        return;
      }

      const result = await markLessonUnpaid(lessonId);

      setIsUpdating(false);

      if (!result.ok) {
        setError(result.error ?? "Could not update.");
        return;
      }

      setPaymentStatus("unpaid");
      router.refresh();
      return;
    }

    const result = await payOutstandingLessonAmount(lessonId);

    setIsUpdating(false);

    if (!result.ok) {
      setError(result.error ?? "Could not update.");
      return;
    }

    setPaymentStatus("paid");
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={isUpdating}
        className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 sm:w-auto"
      >
        {isUpdating ? "Saving..." : paymentStatus === "paid" ? "Mark unpaid" : "Mark paid"}
      </button>
      {compact ? (
        error ? <p className="text-xs text-rose-700">{error}</p> : null
      ) : (
        <div className="min-h-4">{error ? <p className="text-xs text-rose-700">{error}</p> : null}</div>
      )}
    </div>
  );
}
