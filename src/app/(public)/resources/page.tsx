import { createPublicMetadata } from "@/lib/seo";
import { ResourceActionLink, ResourceCardLink } from "../components/resource-actions";
import { NewsletterSignup } from "../newsletter/newsletter-signup";

const description =
  "Free, practical resources for private tutors covering lesson notes, parent updates, and payment tracking.";

export const metadata = createPublicMetadata({
  title: "Free Resources for Private Tutors",
  description,
  path: "/resources",
});

const resources = [
  {
    href: "/tutor-lesson-notes-template",
    title: "Tutor lesson notes template",
    description:
      "A copyable structure for recording lesson focus, progress, homework, effort, and next steps.",
    category: "Lesson records",
    format: "Copyable template",
    resource: "lesson-notes",
  },
  {
    href: "/how-to-write-parent-updates-after-tutoring",
    title: "How to write parent updates after tutoring",
    description:
      "A straightforward format and realistic example for sending useful updates after each lesson.",
    category: "Parent communication",
    format: "Copyable example",
    resource: "parent-updates",
  },
  {
    href: "/tutor-payment-tracker",
    title: "Tutor payment tracker",
    description:
      "What to record so lesson fees, received payments, and outstanding sessions stay clear.",
    category: "Payment tracking",
    format: "Free CSV template",
    resource: "payment-tracker",
  },
] as const;

export default function ResourcesPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 py-6 sm:py-10">
      <header className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Tutor resources
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Practical templates for everyday tutor admin
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Free, useful starting points for keeping lesson records, updating parents, and tracking
          payments without making your workflow more complicated.
        </p>
        <p className="mt-5 text-xs leading-5 text-zinc-500">
          Built from real private tutoring workflows ·{" "}
          <time dateTime="2026-08-10">Reviewed August 2026</time>
        </p>
      </header>

      <section aria-labelledby="choose-a-resource">
        <div className="max-w-2xl">
          <h2 id="choose-a-resource" className="text-xl font-semibold text-zinc-900">
            Start with what you need
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Each resource solves one common piece of tutor admin and can be used straight away.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCardLink key={resource.href} {...resource} />
          ))}
        </div>
      </section>

      <NewsletterSignup compact />

      <section className="rounded-lg bg-blue-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Keep everything together</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-700">
          Tutor Flow connects lesson notes, parent updates, scheduling, and payments in one simple
          workflow.
        </p>
        <div className="mt-5">
          <ResourceActionLink
            href="/signup"
            resource="resource-index"
            action="body_signup"
          >
            Get started free
          </ResourceActionLink>
        </div>
      </section>
    </section>
  );
}
