"use client";

import { useState } from "react";

type CopyUpdateButtonProps = {
  message: string;
};

export function CopyUpdateButton({ message }: CopyUpdateButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setError(null);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn’t copy update.");
    }
  }

  return (
    <div className="min-h-5">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Copy update
      </button>
      {copied ? <p className="mt-1 text-xs text-emerald-700">Copied.</p> : null}
      {!copied && error ? <p className="mt-1 text-xs text-rose-800">{error}</p> : null}
    </div>
  );
}
