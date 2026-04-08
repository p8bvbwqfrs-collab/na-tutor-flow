"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DeleteLessonButtonProps = {
  lessonId: string;
  studentId: string;
};

export function DeleteLessonButton({ lessonId, studentId }: DeleteLessonButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        setIsOpen(false);
        setError(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isDeleting]);

  async function onDelete() {
    const supabase = createSupabaseBrowserClient();
    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase.from("lessons").delete().eq("id", lessonId);

    setIsDeleting(false);

    if (deleteError) {
      setError("We couldn’t delete this lesson. Please try again.");
      return;
    }

    setIsOpen(false);
    router.push(`/app/students/${studentId}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
      >
        Delete lesson
      </button>

      {isOpen && isMounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4"
              onClick={() => {
                if (!isDeleting) {
                  setIsOpen(false);
                  setError(null);
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-lesson-title"
                aria-describedby="delete-lesson-description"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-xl"
              >
                <h2 id="delete-lesson-title" className="text-base font-semibold text-zinc-900">
                  Delete lesson?
                </h2>
                <p id="delete-lesson-description" className="mt-2 text-sm text-zinc-600">
                  This will permanently remove this lesson.
                </p>

                {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setError(null);
                    }}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Keep lesson
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-rose-100 disabled:bg-rose-50 disabled:text-rose-300 sm:w-auto"
                  >
                    {isDeleting ? "Deleting..." : "Delete lesson"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
