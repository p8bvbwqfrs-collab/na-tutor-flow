"use client";

import { useEffect, useRef, useState } from "react";

export function AccountDataExportControls() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  function closeDialog() {
    setIsOpen(false);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
      >
        Download my data
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
                  'button:not([disabled]), a[href]',
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
            aria-labelledby="download-data-title"
            aria-describedby="download-data-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="download-data-title" className="text-lg font-semibold text-zinc-900">
              Download a copy of your Tutor Flow data?
            </h2>
            <div
              id="download-data-description"
              className="mt-2 space-y-2 text-sm leading-6 text-zinc-600"
            >
              <p>
                The JSON file includes your students, contact details, lesson notes, payments and
                preferences.
              </p>
              <p>
                It may contain private information about students and parents. Store it securely
                and avoid downloading it on a shared device.
              </p>
              <p>Downloading a copy does not change or remove anything in Tutor Flow.</p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeDialog}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <a
                href="/app/settings/export"
                download
                onClick={() => {
                  setIsOpen(false);
                  requestAnimationFrame(() => openButtonRef.current?.focus());
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Download JSON file
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
