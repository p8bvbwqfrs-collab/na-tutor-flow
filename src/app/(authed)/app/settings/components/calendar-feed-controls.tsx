"use client";

import { useEffect, useRef, useState } from "react";
import { resetTutoringCalendarFeed } from "../calendar-feed-actions";
import { CopyFeedLinkButton } from "./copy-feed-link-button";

type CalendarFeedControlsProps = {
  feedUrl: string;
  subscribeUrl: string;
  unavailable: boolean;
};

export function CalendarFeedControls({
  feedUrl,
  subscribeUrl,
  unavailable,
}: CalendarFeedControlsProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const resetInFlightRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  function closeDialog() {
    if (isResetting) {
      return;
    }

    setIsOpen(false);
    setError(null);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  async function onReset() {
    if (resetInFlightRef.current) {
      return;
    }

    resetInFlightRef.current = true;
    setIsResetting(true);
    setError(null);

    try {
      const result = await resetTutoringCalendarFeed();

      if (!result.ok) {
        resetInFlightRef.current = false;
        setIsResetting(false);
        setError(result.error);
        return;
      }

      window.location.replace("/app/settings?calendar_reset=1");
    } catch {
      resetInFlightRef.current = false;
      setIsResetting(false);
      setError("We couldn’t reset your calendar link. Please try again.");
    }
  }

  return (
    <>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
        <a
          href={unavailable ? "#" : subscribeUrl}
          className="inline-flex min-h-10 min-w-[8.5rem] items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-zinc-300"
          aria-disabled={unavailable}
        >
          Subscribe in calendar app
        </a>
        <CopyFeedLinkButton
          url={feedUrl}
          label="Copy calendar link"
          unavailable={unavailable}
        />
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={unavailable}
          className="inline-flex min-h-10 min-w-[8.5rem] items-center justify-center rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-500"
        >
          Reset private link
        </button>
      </div>

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
                  "button:not([disabled])",
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
            aria-labelledby="reset-calendar-title"
            aria-describedby="reset-calendar-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="reset-calendar-title" className="text-lg font-semibold text-zinc-900">
              Reset your private calendar link?
            </h2>
            <div
              id="reset-calendar-description"
              className="mt-2 space-y-2 text-sm leading-6 text-zinc-600"
            >
              <p>The current link will stop working immediately.</p>
              <p>
                Calendars using the old link will no longer update. You’ll need to subscribe again
                using the new link.
              </p>
              <p>Your lessons and calendar entries in Tutor Flow will not be changed.</p>
            </div>

            {error ? (
              <p
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 outline-none"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeDialog}
                disabled={isResetting}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep current link
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={isResetting}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {isResetting ? "Resetting..." : "Reset link"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
