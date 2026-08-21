"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { focusRing } from "@/lib/ui-patterns";

const DISMISSED_STORAGE_KEY = "tutor-flow-newsletter-invitation-dismissed-v1";
const DISMISSED_EVENT = "tutor-flow-newsletter-invitation-change";
let dismissedInMemory = false;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISSED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISSED_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  if (dismissedInMemory) return false;

  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

export function NewsletterInvitation() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isVisible) return null;

  function dismiss() {
    dismissedInMemory = true;

    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, "1");
    } catch {
      // The invitation can still be hidden for this page view when storage is unavailable.
    }

    window.dispatchEvent(new Event(DISMISSED_EVENT));

    try {
      track("newsletter_invitation", { action: "dismiss" });
    } catch {
      // Dismissing the invitation must never depend on analytics.
    }
  }

  return (
    <aside
      aria-labelledby="newsletter-invitation-heading"
      className="mx-auto mb-4 w-full max-w-4xl px-4"
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
            Tutor Flow Notes
          </p>
          <h2 id="newsletter-invitation-heading" className="mt-1 text-base font-semibold text-zinc-950">
            One useful idea for independent tutors each month
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-700">
            Practical notes on lesson records, parent updates, payments and a calmer tutoring workflow.
          </p>
        </div>

        <div className="mt-3 grid shrink-0 gap-2 sm:mt-0 sm:flex sm:items-center">
          <Link
            href="/newsletter#newsletter-signup"
            onClick={() => {
              try {
                track("newsletter_invitation", { action: "open" });
              } catch {
                // Navigation must never depend on analytics.
              }
            }}
            className={`inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 ${focusRing}`}
          >
            Join the newsletter
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-white hover:text-zinc-950 ${focusRing}`}
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
