"use client";

import { useState } from "react";

type ProgressSignalCardProps = {
  label: string;
  detail: string;
  explanation: string;
  tone: "improving" | "stable" | "attention" | "neutral";
};

const toneClassNames: Record<ProgressSignalCardProps["tone"], string> = {
  improving: "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300",
  stable: "border-amber-200 bg-amber-50/60 hover:border-amber-300",
  attention: "border-rose-100 bg-rose-50 hover:border-zinc-300",
  neutral: "border-zinc-200 bg-white hover:border-zinc-300",
};

export function ProgressSignalCard({
  label,
  detail,
  explanation,
  tone,
}: ProgressSignalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      className={`rounded-lg border p-4 text-left transition-colors hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${toneClassNames[tone]}`}
      aria-expanded={isOpen}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Progress signal</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{label}</p>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
      {isOpen ? <p className="mt-3 text-sm text-zinc-600">{explanation}</p> : null}
    </button>
  );
}
