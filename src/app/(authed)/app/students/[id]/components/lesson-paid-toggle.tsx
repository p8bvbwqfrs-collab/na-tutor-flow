"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LessonPaidToggleProps = {
  lessonId: string;
  initialPaid: boolean;
};

export function LessonPaidToggle({ lessonId, initialPaid }: LessonPaidToggleProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [paid, setPaid] = useState(initialPaid);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onToggle() {
    const nextPaid = !paid;

    setError(null);
    setPaid(nextPaid);
    setIsUpdating(true);

    const { error: updateError } = await supabase
      .from("lessons")
      .update({ paid: nextPaid })
      .eq("id", lessonId);

    setIsUpdating(false);

    if (updateError) {
      setPaid(!nextPaid);
      setError("Could not update.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={isUpdating}
        className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        {isUpdating ? "Saving..." : paid ? "Mark unpaid" : "Mark paid"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
