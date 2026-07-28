"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitPermanentStudentDeletion } from "@/lib/permanent-student-deletion";
import { deleteStudentPermanently } from "../../student-actions";

type PermanentStudentDeletionProps = {
  studentId: string;
  studentName: string;
};

export function PermanentStudentDeletion({
  studentId,
  studentName,
}: PermanentStudentDeletionProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const deletionInFlightRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      confirmationInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  function closeDialog() {
    if (isDeleting) {
      return;
    }

    setIsOpen(false);
    setConfirmationName("");
    setError(null);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (deletionInFlightRef.current) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const result = await submitPermanentStudentDeletion({
      inFlight: deletionInFlightRef,
      deleteStudent: () =>
        deleteStudentPermanently({
          studentId,
          confirmationName,
        }),
      navigate: (path) => window.location.replace(path),
    });

    if (result.status === "error") {
      setIsDeleting(false);
      setError(result.error);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-rose-200 bg-rose-50/50 p-4 sm:p-5">
      <h2 className="text-base font-semibold text-rose-950">Delete student permanently</h2>
      <p className="mt-2 text-sm leading-6 text-rose-900">
        Permanently delete this student and their associated lessons, scheduled or cancelled
        lessons, payments, allocations, notes and progress data.
      </p>
      <p className="mt-2 text-sm font-medium text-rose-950">This action cannot be undone.</p>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
      >
        Delete student permanently
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeDialog();
            }

            if (event.key === "Tab" && dialogRef.current) {
              const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(
                  'button:not([disabled]), input:not([disabled])',
                ),
              );
              const first = focusable[0];
              const last = focusable[focusable.length - 1];

              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-student-title"
            aria-describedby="delete-student-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="delete-student-title" className="text-lg font-semibold text-zinc-900">
              Permanently delete {studentName}?
            </h2>
            <p id="delete-student-description" className="mt-2 text-sm leading-6 text-zinc-600">
              This removes all student details, lessons, payments, allocations, notes and progress
              data. It cannot be undone.
            </p>

            <form onSubmit={onSubmit} className="mt-5">
              <label
                htmlFor="student-deletion-confirmation"
                className="block text-sm font-medium text-zinc-800"
              >
                Type <span className="font-semibold">{studentName}</span> to confirm
              </label>
              <input
                ref={confirmationInputRef}
                id="student-deletion-confirmation"
                value={confirmationName}
                onChange={(event) => setConfirmationName(event.target.value)}
                disabled={isDeleting}
                autoComplete="off"
                aria-describedby={error ? "student-deletion-error" : undefined}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 disabled:bg-zinc-100"
              />

              {error ? (
                <p
                  ref={errorRef}
                  id="student-deletion-error"
                  role="alert"
                  tabIndex={-1}
                  className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 outline-none"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isDeleting}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || confirmationName !== studentName}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {isDeleting ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
