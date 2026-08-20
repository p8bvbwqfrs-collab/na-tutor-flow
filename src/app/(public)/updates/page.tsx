import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_UPDATES } from "@/lib/product-updates";
import { createPublicMetadata } from "@/lib/seo";
import { primaryAction, secondaryAction } from "@/lib/ui-patterns";

export const metadata: Metadata = createPublicMetadata({
  title: "What's new",
  description:
    "See the latest tutor-facing improvements to Tutor Flow, including lesson, payment, reporting and sharing workflows.",
  path: "/updates",
});

function formatUpdateDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function UpdatesPage() {
  return (
    <section className="mx-auto max-w-3xl py-6 sm:py-10">
      <header className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-panel)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Product updates
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          What&apos;s new in Tutor Flow
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          A short record of meaningful improvements for tutors. Dates show when changes went live;
          routine maintenance and sensitive security details are intentionally left out.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {PRODUCT_UPDATES.map((update, index) => (
          <article
            key={`${update.date}-${update.title}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-panel)] sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <time dateTime={update.date} className="text-sm font-medium text-blue-700">
                {formatUpdateDate(update.date)}
              </time>
              {index === 0 ? (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                  Latest
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">{update.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">{update.summary}</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
              {update.changes.map((change) => (
                <li key={change} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-950">Try the latest version</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Tutor Flow is free for early adopters. Existing tutors can sign in to use every update
          listed above.
        </p>
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
          <Link href="/signup" className={primaryAction + " w-full sm:w-auto"}>
            Get started free
          </Link>
          <Link href="/login" className={secondaryAction + " w-full sm:w-auto"}>
            Sign in
          </Link>
        </div>
      </section>
    </section>
  );
}
