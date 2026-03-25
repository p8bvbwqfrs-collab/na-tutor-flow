import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          NA&apos;s Tutor Flow
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Log lessons, update parents, and track payments — all in one place.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          A simple tool for independent tutors to log lessons, update parents, and track payments — all in one place.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Get started
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">
          Everything you need after each lesson — in one place
        </h2>
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="border-b border-zinc-200 pb-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Today&apos;s lesson flow</p>
              <p className="text-sm text-zinc-600">Student notes, parent updates, and payment status in one view.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Students</p>
              <p className="mt-2 text-sm text-zinc-600">Quick access to each student.</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lessons</p>
              <p className="mt-2 text-sm text-zinc-600">Log outcomes in under a minute.</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Payments</p>
              <p className="mt-2 text-sm text-zinc-600">Track paid and unpaid lessons clearly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">How it works</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step 1</p>
            <p className="mt-2 text-sm text-zinc-600">Add students.</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step 2</p>
            <p className="mt-2 text-sm text-zinc-600">Log lessons.</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step 3</p>
            <p className="mt-2 text-sm text-zinc-600">Copy updates and track payments.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
