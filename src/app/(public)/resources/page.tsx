import Link from "next/link";
import { createPublicMetadata } from "@/lib/seo";

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
    label: "Lesson records",
  },
  {
    href: "/how-to-write-parent-updates-after-tutoring",
    title: "How to write parent updates after tutoring",
    description:
      "A straightforward format and realistic example for sending useful updates after each lesson.",
    label: "Parent communication",
  },
  {
    href: "/tutor-payment-tracker",
    title: "Tutor payment tracker",
    description:
      "What to record so lesson fees, received payments, and outstanding sessions stay clear.",
    label: "Payments",
  },
] as const;

export default function ResourcesPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <header className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Tutor resources
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Practical templates for everyday tutor admin
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Free, useful starting points for keeping lesson records, updating parents, and tracking
          payments without making your workflow more complicated.
        </p>
      </header>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <article key={resource.href} className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              {resource.label}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">{resource.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{resource.description}</p>
            <Link
              href={resource.href}
              className="mt-4 inline-flex min-h-11 items-center rounded-md font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Read the resource
            </Link>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Keep everything together</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
          Tutor Flow connects lesson notes, parent updates, scheduling, and payments in one simple
          workflow.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Get started free
        </Link>
      </section>
    </section>
  );
}
