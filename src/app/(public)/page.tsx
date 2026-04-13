import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          NA&apos;s Tutor Flow
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Run your tutoring without the admin.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Log lessons, send parent updates, and schedule the next session — all in one place.
        </p>
        <div className="mt-6">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get started
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              See how it works
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Built for independent tutors</p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">
          Everything you need after each lesson — in one place
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Notes, parent updates, scheduling, and payments — all connected in one simple workflow.
        </p>
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="border-b border-zinc-200 pb-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Today&apos;s lesson flow</p>
              <p className="text-sm text-zinc-600">Lesson notes, scheduling, progress, and parent follow-up in one view.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Students</p>
              <p className="mt-2 text-sm text-zinc-600">
                See each student&apos;s lessons, progress, and notes in one place.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lessons</p>
              <p className="mt-2 text-sm text-zinc-600">
                Log what you covered and schedule the next session straight away.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Calendar</p>
              <p className="mt-2 text-sm text-zinc-600">
                See upcoming and completed lessons at a glance.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Parent updates</p>
              <p className="mt-2 text-sm text-zinc-600">
                Turn your notes into clear updates you can send in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Helpful resources for tutors</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Simple guides and templates for lesson notes, parent updates, and payment tracking.
        </p>
        <div className="mt-4 flex flex-col gap-3">
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

    </section>
  );
}
