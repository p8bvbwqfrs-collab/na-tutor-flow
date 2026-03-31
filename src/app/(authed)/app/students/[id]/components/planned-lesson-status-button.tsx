"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PlannedLessonStatusButtonProps = {
  lessonId: string;
  nextStatus: "cancelled" | "planned";
  label: string;
  className?: string;
};

export function PlannedLessonStatusButton({
  lessonId,
  nextStatus,
  label,
  className,
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
        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-zinc-400 ${
          className ??
          "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
        }`}
      >
        {isUpdating ? "Saving..." : label}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
