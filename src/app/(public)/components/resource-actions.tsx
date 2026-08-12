"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { focusRing, primaryAction } from "@/lib/ui-patterns";

type ResourceActionLinkProps = {
  href: string;
  resource: string;
  action: string;
  children: React.ReactNode;
  download?: boolean;
  variant?: "primary" | "secondary";
};

export function ResourceActionLink({
  href,
  resource,
  action,
  children,
  download = false,
  variant = "primary",
}: ResourceActionLinkProps) {
  const className =
    variant === "primary"
      ? primaryAction + " w-full sm:w-auto"
      : "inline-flex min-h-11 w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-700 sm:w-auto " + focusRing;

  return (
    <a
      href={href}
      download={download || undefined}
      className={className}
      onClick={() => {
        try {
          track("resource_action", { resource, action });
        } catch {
          // Analytics must never prevent the requested navigation or download.
        }
      }}
    >
      {children}
    </a>
  );
}

type CopyResourceButtonProps = {
  copyText: string;
  resource: string;
  action: string;
  label: string;
};

export function CopyResourceButton({
  copyText,
  resource,
  action,
  label,
}: CopyResourceButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyResource() {
    try {
      await navigator.clipboard.writeText(copyText);
      setStatus("copied");
      try {
        track("resource_action", { resource, action });
      } catch {
        // Copying remains successful if analytics is unavailable.
      }
    } catch {
      setStatus("error");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={copyResource}
        className={primaryAction + " w-full sm:w-auto"}
      >
        {status === "copied" ? "Copied" : label}
      </button>
      <p className="mt-2 min-h-5 text-xs text-zinc-600" role="status" aria-live="polite">
        {status === "copied" && "Ready to paste wherever you keep your records."}
        {status === "error" && "Copy unavailable. Select the example below and copy it manually."}
      </p>
    </div>
  );
}

type ResourceCardLinkProps = {
  href: string;
  resource: string;
  category: string;
  title: string;
  description: string;
  format: string;
};

export function ResourceCardLink({
  href,
  resource,
  category,
  title,
  description,
  format,
}: ResourceCardLinkProps) {
  return (
    <a
      href={href}
      className={"group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-panel)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-6 " + focusRing}
      onClick={() => {
        try {
          track("resource_action", { resource: "resource-index", action: `open_${resource}` });
        } catch {
          // Analytics must never prevent navigation to a resource.
        }
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
        {category}
      </p>
      <h3 className="mt-3 text-lg font-semibold leading-6 text-zinc-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
      <div className="mt-auto pt-6">
        <p className="text-xs font-medium text-zinc-500">{format}</p>
        <p className="mt-2 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 group-hover:decoration-zinc-700">
          Open resource <span aria-hidden="true">→</span>
        </p>
      </div>
    </a>
  );
}
