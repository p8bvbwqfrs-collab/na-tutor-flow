"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MarkPaidButtonProps = {
  lessonId: string;
};

export function MarkPaidButton({ lessonId }: MarkPaidButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onMarkPaid() {
    const supabase = createSupabaseBrowserClient();

    setIsUpdating(true);
    setError(null);
    setMarked(true);

    const { error: updateError } = await supabase
      .from("lessons")
      .update({ paid: true })
      .eq("id", lessonId)
      .eq("paid", false);

    setIsUpdating(false);

    if (updateError) {
      setMarked(false);
      setError("Could not update payment status.");
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
        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-600"
      >
        {isUpdating ? "Saving..." : marked ? "Marked" : "Mark paid"}
      </button>
      {error ? <p role="alert" className="text-xs text-rose-900">{error}</p> : null}
    </div>
  );
}
