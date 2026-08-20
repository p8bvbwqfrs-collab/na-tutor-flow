"use client";

import { useState } from "react";
import { trackActivationStep } from "@/lib/product-analytics";

const DEFAULT_SHARE_MESSAGE =
  "I thought you might find Tutor Flow useful. It keeps student records, lesson notes, schedules, payments and parent updates together for independent tutors. It’s free for early adopters: https://www.natutorflow.com";

export function ShareTutorFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_SHARE_MESSAGE);
  const [status, setStatus] = useState<string | null>(null);
  const panelId = "share-tutor-flow-panel";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus("Tutor Flow message copied.");
      trackActivationStep("tutor_flow_shared");
    } catch {
      setStatus("We couldn’t copy the message. Select the text and copy it manually.");
    }
  }

  async function shareMessage() {
    if (!navigator.share) {
      await copyMessage();
      return;
    }

    try {
      await navigator.share({ title: "Tutor Flow", text: message });
      setStatus("Tutor Flow shared.");
      trackActivationStep("tutor_flow_shared");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      await copyMessage();
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">Know another independent tutor?</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Send them a short introduction to Tutor Flow. Nothing is sent automatically.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => {
            setIsOpen((current) => !current);
            setStatus(null);
          }}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          {isOpen ? "Close share message" : "Share Tutor Flow"}
        </button>
      </div>

      {isOpen ? (
        <div id={panelId} className="mt-4 border-t border-blue-200 pt-4">
          <label htmlFor="tutor-flow-share-message" className="block text-sm font-medium text-zinc-900">
            Message to share
          </label>
          <textarea
            id="tutor-flow-share-message"
            rows={7}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setStatus(null);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 text-zinc-900 shadow-sm focus:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={shareMessage}
              disabled={!message.trim()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Share message
            </button>
            <button
              type="button"
              onClick={copyMessage}
              disabled={!message.trim()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Copy message
            </button>
          </div>
          <p className="mt-2 min-h-5 text-sm text-zinc-600" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      ) : null}
    </div>
  );
}
