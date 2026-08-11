"use client";

import { useId, useState, type ReactNode } from "react";

type SectionHeadingProps = {
  title: ReactNode;
  description: ReactNode;
  level?: 1 | 2 | 3;
  id?: string;
  className?: string;
  headingClassName?: string;
};

export function SectionHeading({
  title,
  description,
  level = 2,
  id,
  className = "",
  headingClassName = "text-lg font-medium text-zinc-900",
}: SectionHeadingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const descriptionId = `${generatedId}-description`;
  const label = typeof title === "string" ? title : "this section";
  const heading =
    level === 1 ? (
      <h1 id={id} className={headingClassName}>{title}</h1>
    ) : level === 3 ? (
      <h3 id={id} className={headingClassName}>{title}</h3>
    ) : (
      <h2 id={id} className={headingClassName}>{title}</h2>
    );

  return (
    <div className={className}>
      <div className="flex min-w-0 items-center gap-1">
        {heading}
        <button
          type="button"
          aria-label={`About ${label}`}
          aria-expanded={isOpen}
          aria-controls={descriptionId}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs font-semibold"
          >
            i
          </span>
        </button>
      </div>
      {isOpen ? (
        <p
          id={descriptionId}
          className="mt-1 max-w-2xl rounded-md bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-600"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
