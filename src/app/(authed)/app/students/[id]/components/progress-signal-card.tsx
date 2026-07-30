"use client";

import { useState } from "react";

type ProgressSignalCardProps = {
  label: string;
  detail: string;
  explanation: string;
  tone: "improving" | "stable" | "attention" | "neutral";
};

const toneClassNames: Record<ProgressSignalCardProps["tone"], string> = {
  improving: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300",
  stable: "border-blue-200 bg-blue-50/70 hover:border-blue-300",
  attention: "border-rose-200 bg-rose-50/70 hover:border-rose-300",
  neutral: "border-zinc-200 bg-white hover:border-zinc-300",
};

const toneTextClassNames: Record<ProgressSignalCardProps["tone"], string> = {
  improving: "text-emerald-900",
  stable: "text-blue-900",
  attention: "text-rose-900",
  neutral: "text-zinc-900",
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
      <p className={`mt-2 text-2xl font-semibold ${toneTextClassNames[tone]}`}>{label}</p>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
      {isOpen ? <p className="mt-3 text-sm text-zinc-600">{explanation}</p> : null}
    </button>
  );
}
