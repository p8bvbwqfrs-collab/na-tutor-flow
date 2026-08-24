import type { Metadata } from "next";
import Link from "next/link";
import { createPublicMetadata } from "@/lib/seo";
import { NEWSLETTER_ISSUES, NEWSLETTER_NAME } from "@/lib/newsletter";
import { NewsletterActionLink } from "./newsletter-actions";
import { NewsletterSignup } from "./newsletter-signup";

const description =
  "Short, practical notes for independent tutors on lesson records, parent updates, payments and calmer tutoring admin.";

export const metadata: Metadata = createPublicMetadata({
  title: `${NEWSLETTER_NAME} for Independent Tutors`,
  description,
  path: "/newsletter",
});

type NewsletterPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const { from } = await searchParams;

  return (
    <section className="mx-auto max-w-4xl space-y-8 py-6 sm:py-10">
      {from === "signup" ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
        >
          Your Tutor Flow account is ready. Newsletter signup is separate and optional—join below
          if you&apos;d like the monthly notes.
        </p>
      ) : null}

      <header className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[var(--shadow-panel)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          A practical monthly note
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {NEWSLETTER_NAME}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Useful ideas from building and using Tutor Flow in a real private tutoring workflow—kept
          short enough to apply between lessons.
        </p>
        <p className="mt-5 text-xs leading-5 text-zinc-500">
          Written by Naz · Independent maths tutor and Tutor Flow founder
        </p>
      </header>

      <NewsletterSignup />

      <section aria-labelledby="newsletter-archive">
        <div className="max-w-2xl">
          <h2 id="newsletter-archive" className="text-xl font-semibold text-zinc-900">
            Read the notes
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Every edition is free to read on the website and ordered newest first.
          </p>
        </div>

        <ol className="mt-4 space-y-4">
          {NEWSLETTER_ISSUES.map((issue) => (
            <li key={issue.slug}>
              <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[var(--shadow-panel)] sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                  <time dateTime={issue.publishedAt}>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(`${issue.publishedAt}T00:00:00Z`))}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{issue.readTime}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-7 text-zinc-900">
                  <Link
                    href={`/newsletter/${issue.slug}`}
                    className="underline decoration-zinc-200 underline-offset-4 transition-colors hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {issue.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  {issue.description}
                </p>
                <div className="mt-4">
                  <NewsletterActionLink
                    href={`/newsletter/${issue.slug}`}
                    action="open_issue"
                  >
                    Read this note <span aria-hidden="true">→</span>
                  </NewsletterActionLink>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
