"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  submitAccountDeletion,
  type AccountDeletionResult,
} from "@/lib/account-deletion";

type AccountDeletionControlsProps = {
  accountEmail: string;
};

export function AccountDeletionControls({ accountEmail }: AccountDeletionControlsProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const deletionInFlightRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
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
    setConfirmationEmail("");
    setHasAcknowledged(false);
    setError(null);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  async function requestAccountDeletion(): Promise<AccountDeletionResult> {
    const response = await fetch("/app/settings/delete-account", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmationEmail }),
    });
    const body = (await response.json()) as AccountDeletionResult;

    if (!response.ok && body.ok) {
      return {
        ok: false,
        status: 500,
        error: "Your account could not be deleted. Please try again.",
      };
    }

    return body;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAcknowledged || confirmationEmail !== accountEmail) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const result = await submitAccountDeletion({
      inFlight: deletionInFlightRef,
      deleteAccount: requestAccountDeletion,
      navigate: (path) => window.location.replace(path),
    });

    if (result.status === "error") {
      setIsDeleting(false);
      setError(result.error);
    }
  }

  return (
    <section className="mt-6 border-t border-rose-200 pt-5">
      <h3 className="text-base font-semibold text-rose-950">Delete your account</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Permanently remove your Tutor Flow account and every student, lesson, payment, note and
        preference saved within it.
      </p>
      <p className="mt-2 text-sm font-medium text-rose-900">
        Download your data first if you may need it later. Account deletion cannot be undone.
      </p>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-800 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 sm:w-auto"
      >
        Delete my account
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
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="delete-account-title" className="text-lg font-semibold text-zinc-900">
              Permanently delete your account?
            </h2>
            <div
              id="delete-account-description"
              className="mt-2 space-y-2 text-sm leading-6 text-zinc-600"
            >
              <p>
                This permanently deletes your sign-in and all Tutor Flow data, including active and
                archived students, scheduled and completed lessons, payments and notes.
              </p>
              <p className="font-medium text-rose-900">
                You will be signed out immediately. This action cannot be undone.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-5">
              <label
                htmlFor="account-deletion-confirmation"
                className="block text-sm font-medium text-zinc-800"
              >
                Type <span className="break-all font-semibold">{accountEmail}</span> to confirm
              </label>
              <input
                ref={confirmationInputRef}
                id="account-deletion-confirmation"
                type="email"
                value={confirmationEmail}
                onChange={(event) => {
                  setConfirmationEmail(event.target.value);
                  setError(null);
                }}
                disabled={isDeleting}
                autoComplete="off"
                spellCheck={false}
                aria-describedby={error ? "account-deletion-error" : undefined}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 disabled:bg-zinc-100"
              />

              <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-zinc-700">
                <input
                  type="checkbox"
                  checked={hasAcknowledged}
                  onChange={(event) => {
                    setHasAcknowledged(event.target.checked);
                    setError(null);
                  }}
                  disabled={isDeleting}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
                />
                <span>I understand that my account and all of its data will be permanently deleted.</span>
              </label>

              {error ? (
                <p
                  ref={errorRef}
                  id="account-deletion-error"
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
                  Keep my account
                </button>
                <button
                  type="submit"
                  disabled={
                    isDeleting || !hasAcknowledged || confirmationEmail !== accountEmail
                  }
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {isDeleting ? "Deleting account..." : "Delete account permanently"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
