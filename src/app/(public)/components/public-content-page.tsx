import Link from "next/link";
import { ReactNode } from "react";

type PublicContentPageProps = {
  title: string;
  intro: ReactNode;
  children: ReactNode;
};

export function PublicContentPage({
  title,
  intro,
  children,
}: PublicContentPageProps) {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">{intro}</div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type PublicSectionProps = {
  title: string;
  children: ReactNode;
};

export function PublicSection({ title, children }: PublicSectionProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
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
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">You might also find useful</h2>
      <div className="mt-3 flex flex-col gap-3">
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
    </section>
  );
}

type PublicCtaSectionProps = {
  title?: string;
  body: ReactNode;
  ctaLabel: string;
  ctaHref: string;
};

export function PublicCtaSection({
  title = "If you want to save time",
  body,
  ctaLabel,
  ctaHref,
}: PublicCtaSectionProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-6 text-zinc-600">{body}</div>
      <div className="mt-4">
        <a
          href={ctaHref}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
