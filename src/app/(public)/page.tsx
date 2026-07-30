import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tutor Flow – Simple tutor management software for private tutors",
  description: "Log lessons, track payments, and send updates in one simple tool built for private tutors.",
};

const steps = [
  {
    title: "Log the lesson",
    copy: "Capture what you covered while it is still fresh.",
  },
  {
    title: "Schedule the next session",
    copy: "Set the follow-up date without breaking your flow.",
  },
  {
    title: "Share an update",
    copy: "Turn notes into a clear message in seconds.",
  },
  {
    title: "Track payments",
    copy: "See what has been received and what still needs attention.",
  },
];

const features = [
  {
    icon: "students",
    title: "Students",
    copy: "See each student’s lessons and progress",
  },
  {
    icon: "lessons",
    title: "Lessons",
    copy: "Log what you covered and schedule next session",
  },
  {
    icon: "calendar",
    title: "Calendar",
    copy: "View upcoming and completed lessons",
  },
  {
    icon: "updates",
    title: "Updates",
    copy: "Turn notes into clear updates in seconds",
  },
];

const reassurances = [
  {
    title: "Built by a tutor",
    copy: "Designed around the real admin that follows a private lesson.",
  },
  {
    title: "Your data stays yours",
    copy: "Export your account data or permanently delete it from Settings.",
  },
  {
    title: "Simple from day one",
    copy: "Start with one student and add the rest when you are ready.",
  },
] as const;

const faqs = [
  {
    question: "Who is Tutor Flow for?",
    answer:
      "Tutor Flow is designed for independent tutors who want one straightforward place for lesson records, scheduling, parent updates, and payment tracking.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Tutor Flow is currently free to get started. It is an early-stage product, so the service and its features will continue to develop.",
  },
  {
    question: "What happens to the information I add?",
    answer:
      "You retain ownership of your student and lesson data. You can download a portable copy or permanently delete your account and saved data from Settings.",
  },
] as const;

function FeatureIcon({ icon }: { icon: string }) {
  const commonProps = {
    className: "h-5 w-5 text-zinc-400",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  if (icon === "students") {
    return (
      <svg {...commonProps}>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-7 0V19" />
        <path d="M12.5 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M18 18v-1a3 3 0 0 0-2.2-2.9" />
        <path d="M16 8.2a2.5 2.5 0 0 1 0 4.6" />
      </svg>
    );
  }

  if (icon === "lessons") {
    return (
      <svg {...commonProps}>
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v17H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
        <path d="M9 7h6" />
        <path d="M9 11h5" />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg {...commonProps}>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M5 7.5h14" />
      <path d="M5 12h10" />
      <path d="M5 16.5h7" />
      <path d="m16 16 2 2 3-4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10 xl:gap-12">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:text-sm sm:tracking-[0.18em]">
              Built for independent tutors
            </p>
            <h1 className="mx-auto mt-3 max-w-[24ch] text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:mx-0">
              Spend less time on admin, more time teaching
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 lg:mx-0">
              Log lessons, track payments, and send updates — all in one simple tool for tutors.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                Get started free
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                See how it works
              </Link>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500 lg:mx-0">
              For private tutors who want to stay organised without spreadsheets or extra admin tools.
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl lg:mr-0 lg:max-w-none">
            <img
              src="/images/tutor-flow-student-preview.png"
              alt="Tutor Flow student page showing lesson notes, progress, and upcoming lessons"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-zinc-900">Everything you need after each lesson</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            A simple workflow to keep your tutoring organised.
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step {index + 1}</p>
                <h4 className="mt-2 text-sm font-semibold text-zinc-900">{step.title}</h4>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-zinc-100">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-3 lg:px-4 first:lg:pl-0 last:lg:pr-0">
              <FeatureIcon icon={feature.icon} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800">{feature.title}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-500">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6" aria-labelledby="trust-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Free to get started
            </p>
            <h2 id="trust-heading" className="mt-2 text-xl font-semibold text-zinc-900">
              A practical tool, without the heavy setup
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Create an account and try the core Tutor Flow workflow. The product is still
              developing, with a focus on keeping everyday tutor admin clear and manageable.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                href="/about"
                className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Why I built it
              </Link>
              <Link
                href="/privacy"
                className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Read the privacy policy
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {reassurances.map((item) => (
              <article key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Free resources for tutors</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Simple guides and templates for lesson notes, parent updates, and payment tracking.
        </p>
        <div className="mt-4 grid gap-3">
          <Link
            href="/tutor-lesson-notes-template"
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Tutor lesson notes template
          </Link>
          <Link
            href="/tutor-payment-tracker"
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Tutor payment tracker
          </Link>
          <Link
            href="/how-to-write-parent-updates-after-tutoring"
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            How to write parent updates after tutoring
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6" aria-labelledby="faq-heading">
        <div className="max-w-2xl">
          <h2 id="faq-heading" className="text-xl font-semibold text-zinc-900">
            Questions before you start
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            The essentials about the product and your data.
          </p>
        </div>
        <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
          {faqs.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="text-lg font-normal text-zinc-500 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="max-w-3xl pb-1 pr-8 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold text-zinc-900">Start using Tutor Flow in minutes</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Create your free account, add one student, and see how the workflow fits your tutoring.
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
