"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type StudentArchiveToggleProps = {
  studentId: string;
  isArchived: boolean;
};

export function StudentArchiveToggle({ studentId, isArchived }: StudentArchiveToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onToggleArchive() {
    setError(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const archivedAt = isArchived ? null : new Date().toISOString();

    const { error: updateError } = await supabase
      .from("students")
      .update({ archived_at: archivedAt })
      .eq("id", studentId);

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message || "Could not update student status.");
      return;
    }

    router.push("/app/students");
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggleArchive}
        disabled={isSubmitting}
        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
      >
        {isSubmitting ? "Saving..." : isArchived ? "Restore" : "Archive"}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-rose-900">
          {error}
        </p>
      ) : null}
    </div>
  );
}
