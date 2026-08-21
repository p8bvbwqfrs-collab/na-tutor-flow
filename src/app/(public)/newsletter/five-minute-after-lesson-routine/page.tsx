import type { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";
import { NEWSLETTER_ISSUES } from "@/lib/newsletter";
import { NewsletterActionLink } from "../newsletter-actions";
import { NewsletterSignup } from "../newsletter-signup";

const issue = NEWSLETTER_ISSUES[0];

export const metadata: Metadata = createPublicMetadata({
  title: issue.title,
  description: issue.description,
  path: `/newsletter/${issue.slug}`,
  type: "article",
});

export default function FiveMinuteAfterLessonRoutinePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: issue.title,
    description: issue.description,
    datePublished: issue.publishedAt,
    dateModified: issue.publishedAt,
    author: {
      "@type": "Person",
      name: "Naz",
    },
    publisher: {
      "@type": "Organization",
      name: "Tutor Flow",
      url: "https://www.natutorflow.com",
    },
    mainEntityOfPage: `https://www.natutorflow.com/newsletter/${issue.slug}`,
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-panel)]">
        <header className="border-b border-zinc-200 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Tutor Flow Notes
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {issue.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            {issue.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>By Naz, independent maths tutor</span>
            <span aria-hidden="true">·</span>
            <time dateTime={issue.publishedAt}>21 August 2026</time>
            <span aria-hidden="true">·</span>
            <span>{issue.readTime}</span>
          </div>
        </header>

        <div className="space-y-8 p-6 text-sm leading-7 text-zinc-700 sm:p-8 sm:text-base">
          <section aria-labelledby="why-five-minutes">
            <h2 id="why-five-minutes" className="text-xl font-semibold text-zinc-900">
              The useful five minutes are usually the first five
            </h2>
            <div className="mt-3 space-y-4">
              <p>
                Straight after a lesson, I can still remember the question that unlocked a topic,
                the part that needs revisiting and what I actually promised for next time. Leave it
                until the evening and those details become much harder to reconstruct.
              </p>
              <p>
                The aim is not to write a polished report after every session. It is to close the
                loop while the information is fresh, so tomorrow&apos;s admin does not start with
                yesterday&apos;s unfinished work.
              </p>
            </div>
          </section>

          <section aria-labelledby="routine">
            <h2 id="routine" className="text-xl font-semibold text-zinc-900">
              The five-step routine
            </h2>
            <ol className="mt-4 space-y-4">
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">1. Record what the lesson covered</p>
                <p className="mt-1">
                  Use a few specific topics or skills—not a full transcript. This should be enough
                  to remind you where the session actually went.
                </p>
              </li>
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">2. Capture one clear success</p>
                <p className="mt-1">
                  Write down the strongest evidence of progress: a method used independently, a
                  misconception corrected or a change in confidence.
                </p>
              </li>
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">3. Choose one next focus</p>
                <p className="mt-1">
                  Avoid a long list. One useful improvement or agreed homework task gives the next
                  lesson a clear starting point.
                </p>
              </li>
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">4. Send or save the parent update</p>
                <p className="mt-1">
                  Turn the same notes into a short, readable message. Reusing the facts keeps the
                  update useful without doubling the work.
                </p>
              </li>
              <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">5. Close the practical loose ends</p>
                <p className="mt-1">
                  Check whether payment needs recording and whether the next lesson is scheduled.
                  If neither needs action, you are done.
                </p>
              </li>
            </ol>
          </section>

          <section aria-labelledby="minimum-record">
            <h2 id="minimum-record" className="text-xl font-semibold text-zinc-900">
              Keep the record smaller than the lesson
            </h2>
            <div className="mt-3 space-y-4">
              <p>
                The routine only works if it stays lightweight. A useful lesson record normally
                needs the focus, what went well, what to improve and the next task. Anything else
                should earn its place.
              </p>
              <p>
                If you want a starting structure, use the free{" "}
                <NewsletterActionLink href="/tutor-lesson-notes-template" action="open_resource">
                  tutor lesson notes template
                </NewsletterActionLink>
                . The same information can then become a clear{" "}
                <NewsletterActionLink
                  href="/how-to-write-parent-updates-after-tutoring"
                  action="open_resource"
                >
                  parent update
                </NewsletterActionLink>
                .
              </p>
            </div>
          </section>

          <section aria-labelledby="try-this">
            <h2 id="try-this" className="text-xl font-semibold text-zinc-900">
              Try this after your next lesson
            </h2>
            <p className="mt-3">
              Set a five-minute timer before moving on. Capture the essential notes, deal with
              the parent update, check payment and schedule, then stop. The value is the completed
              loop—not the length of the record.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Want the routine in one place?
            </h2>
            <p className="mt-2">
              Tutor Flow connects lesson notes, parent updates, payments and the next lesson so the
              follow-up can happen as one short workflow.
            </p>
            <div className="mt-4">
              <NewsletterActionLink href="/signup" action="start_free" variant="primary">
                Get started free
              </NewsletterActionLink>
            </div>
          </section>
        </div>
      </article>

      <NewsletterSignup compact />
    </section>
  );
}
