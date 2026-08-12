import type { Metadata } from "next";
import Link from "next/link";
import { TUTOR_FLOW_CONTACT_EMAIL, TUTOR_FLOW_FEEDBACK_EMAIL_HREF } from "@/lib/contact";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "About",
  description:
    "Why Tutor Flow was built to make lesson notes, parent updates, scheduling, and payment tracking simpler for independent tutors.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          A note from the builder
        </h1>
        <p className="mt-3 text-sm font-medium text-zinc-500">Built by a tutor, for tutors</p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">
          <p>
            I built Tutor Flow because I was finding the admin around tutoring more frustrating
            than it needed to be.
          </p>
          <p>
            The lessons themselves are the easy bit. It’s everything after — writing up notes,
            sending updates to parents, keeping track of payments, and remembering what to cover
            next — that slowly adds up and takes over your evenings.
          </p>
          <p>
            I wanted something simple that fit naturally into how I already work: log the lesson,
            send a clear update, and line up the next session without thinking about it too much.
          </p>
          <p>
            Tutor Flow is an independently built, early-stage product. I’m improving it carefully
            based on how it works in real tutoring and the feedback I receive.
          </p>
          <p>
            If you try it and something feels off, missing, or could be better, I’d genuinely
            appreciate you letting me know.
          </p>
        </div>
      </div>

      <section
        className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6"
        aria-labelledby="maintenance-heading"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Product principles
          </p>
          <h2 id="maintenance-heading" className="mt-2 text-xl font-semibold text-zinc-900">
            How Tutor Flow is maintained
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
            The aim is a dependable, focused tool for tutors—not a growing list of features for its
            own sake.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Feedback is weighed carefully</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Suggestions are considered alongside real tutoring workflows, accessibility and the
              needs of other tutors.
            </p>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Changes are checked</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Core workflows are covered by automated checks, with production builds verified
              before releases.
            </p>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Data choices stay clear</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Tutors retain ownership of their data, with export and permanent deletion controls
              explained in the{" "}
              <Link
                href="/privacy"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                privacy policy
              </Link>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">Get in touch</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
          Questions, suggestions and honest feedback are welcome. Email{" "}
          <a
            href={TUTOR_FLOW_FEEDBACK_EMAIL_HREF}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {TUTOR_FLOW_CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </section>
  );
}
