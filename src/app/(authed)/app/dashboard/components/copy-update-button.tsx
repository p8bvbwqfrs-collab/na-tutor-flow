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
        className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Copy update
      </button>
      {copied ? <p className="mt-1 text-xs text-emerald-700">Copied.</p> : null}
      {!copied && error ? <p className="mt-1 text-xs text-rose-800">{error}</p> : null}
    </div>
  );
}
