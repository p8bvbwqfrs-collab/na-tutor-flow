"use client";

import { useState } from "react";

type CopyFeedLinkButtonProps = {
  url: string;
  unavailable?: boolean;
};

export function CopyFeedLinkButton({ url, unavailable = false }: CopyFeedLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    if (unavailable) {
      return;
    }

    setCopied(false);
    setError(null);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("We couldn’t copy the link. Please copy it manually.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onCopy}
        disabled={unavailable}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
      >
        Copy feed link
      </button>
      {copied ? <p className="text-sm text-emerald-700">Copied.</p> : null}
      {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
