import Link from "next/link";
import { ReactNode } from "react";
import { ResourceActionLink } from "./resource-actions";

type PublicContentPageProps = {
  category: string;
  title: string;
  intro: ReactNode;
  resource: string;
  primaryAction: ReactNode;
  children: ReactNode;
};

export function PublicContentPage({
  category,
  title,
  intro,
  resource,
  primaryAction,
  children,
}: PublicContentPageProps) {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{category}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 max-w-2xl space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">
          {intro}
        </div>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
          {primaryAction}
          <ResourceActionLink
            href="/signup"
            resource={resource}
            action="header_signup"
            variant="secondary"
          >
            Try Tutor Flow
          </ResourceActionLink>
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          Built from real private tutoring workflows · <time dateTime="2026-08-10">Reviewed August 2026</time>
        </p>
      </div>
      <article className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {children}
      </article>
    </section>
  );
}

type PublicSectionProps = {
  title: string;
  children: ReactNode;
};

export function PublicSection({ title, children }: PublicSectionProps) {
  return (
    <section className="p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-6 text-zinc-600">{children}</div>
    </section>
  );
}

type ResourceLinksSectionProps = {
  links: Array<{ href: string; label: string }>;
};

export function ResourceLinksSection({ links }: ResourceLinksSectionProps) {
  return (
    <section className="p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">You might also find useful</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link
        href="/resources"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Browse all tutor resources
      </Link>
    </section>
  );
}

type PublicFaqSectionProps = {
  title?: string;
  items: Array<{ question: string; answer: ReactNode }>;
};

export function PublicFaqSection({
  title = "Frequently asked questions",
  items,
}: PublicFaqSectionProps) {
  return (
    <section className="p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
      <div className="mt-3 divide-y divide-zinc-200 border-y border-zinc-200">
        {items.map((item) => (
          <details key={item.question} className="group py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="text-lg font-normal text-zinc-500 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-4 pr-8 text-sm leading-6 text-zinc-600">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

type PublicCtaSectionProps = {
  resource: string;
  title?: string;
  body: ReactNode;
  ctaLabel: string;
  ctaHref: string;
};

export function PublicCtaSection({
  resource,
  title = "If you want to save time",
  body,
  ctaLabel,
  ctaHref,
}: PublicCtaSectionProps) {
  return (
    <section className="p-5 sm:p-6">
      <div className="rounded-lg bg-blue-50 p-5 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
        <div className="mt-3 space-y-4 text-sm leading-6 text-zinc-700">{body}</div>
        <div className="mt-4">
          <ResourceActionLink href={ctaHref} resource={resource} action="body_signup">
            {ctaLabel}
          </ResourceActionLink>
        </div>
      </div>
    </section>
  );
}
