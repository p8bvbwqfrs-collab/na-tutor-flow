"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PlannedLessonStatusButtonProps = {
  lessonId: string;
  nextStatus: "cancelled" | "planned";
  label: string;
};

export function PlannedLessonStatusButton({
  lessonId,
  nextStatus,
  label,
}: PlannedLessonStatusButtonProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setIsUpdating(true);

    const { error: updateError } = await supabase
      .from("lessons")
      .update({ status: nextStatus })
      .eq("id", lessonId);

    setIsUpdating(false);

    if (updateError) {
      setError("Could not update.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isUpdating}
        className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        {isUpdating ? "Saving..." : label}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
