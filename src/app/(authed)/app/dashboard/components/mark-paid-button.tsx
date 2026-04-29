"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payOutstandingLessonAmount } from "../../payment-actions";

type MarkPaidButtonProps = {
  lessonId: string;
};

export function MarkPaidButton({ lessonId }: MarkPaidButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onMarkPaid() {
    setIsUpdating(true);
    setError(null);
    setMarked(true);

    const result = await payOutstandingLessonAmount(lessonId);

    setIsUpdating(false);

    if (!result.ok) {
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
        className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-600 sm:w-auto"
      >
        {isUpdating ? "Saving..." : marked ? "Marked" : "Mark paid"}
      </button>
      {error ? <p role="alert" className="text-xs text-rose-900">{error}</p> : null}
    </div>
  );
}
