"use client";

import { useState } from "react";
import { trackActivationStep } from "@/lib/product-analytics";

type PaymentReminderGeneratorProps = {
  initialMessage: string;
};

export function PaymentReminderGenerator({ initialMessage }: PaymentReminderGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState<string | null>(null);
  const panelId = "payment-reminder-panel";

  async function copyReminder() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus("Payment reminder copied.");
      trackActivationStep("payment_reminder_shared");
    } catch {
      setStatus("We couldn’t copy the reminder. Select the text and copy it manually.");
    }
  }

  async function shareReminder() {
    if (!navigator.share) {
      await copyReminder();
      return;
    }

    try {
      await navigator.share({ title: "Payment reminder", text: message });
      setStatus("Payment reminder shared.");
      trackActivationStep("payment_reminder_shared");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      await copyReminder();
    }
  }

  if (!initialMessage) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">Payment still outstanding?</p>
          <p className="mt-1 text-sm text-zinc-600">
            Create a polite reminder from the current unpaid lessons.
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
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          {isOpen ? "Close reminder" : "Create payment reminder"}
        </button>
      </div>

      {isOpen ? (
        <div id={panelId} className="mt-4 border-t border-amber-200 pt-4">
          <p className="text-sm leading-6 text-zinc-600">
            Nothing is sent automatically. Review and edit the message before sharing.
          </p>
          <label htmlFor="payment-reminder-message" className="mt-3 block text-sm font-medium text-zinc-900">
            Reminder message
          </label>
          <textarea
            id="payment-reminder-message"
            rows={10}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setStatus(null);
            }}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm leading-6 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={shareReminder}
              disabled={!message.trim()}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Share reminder
            </button>
            <button
              type="button"
              onClick={copyReminder}
              disabled={!message.trim()}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Copy reminder
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
