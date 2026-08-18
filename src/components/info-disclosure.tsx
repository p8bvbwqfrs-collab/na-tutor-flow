"use client";

import { useId, useState, type ReactNode } from "react";

type InfoDisclosureProps = {
  trigger: ReactNode;
  label: string;
  description: ReactNode;
  className?: string;
  triggerClassName?: string;
  descriptionClassName?: string;
};

export function InfoDisclosure({
  trigger,
  label,
  description,
  className = "",
  triggerClassName = "flex min-w-0 items-center gap-1.5",
  descriptionClassName = "mt-1 max-w-2xl rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm leading-6 text-zinc-700",
}: InfoDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const descriptionId = `${generatedId}-description`;

  return (
    <div className={className}>
      <div className={triggerClassName}>
        {trigger}
        <button
          type="button"
          aria-label={`About ${label}`}
          aria-expanded={isOpen}
          aria-controls={descriptionId}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-semibold"
          >
            i
          </span>
        </button>
      </div>
      {isOpen ? (
        <p id={descriptionId} className={descriptionClassName}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
