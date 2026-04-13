import Link from "next/link";
import { ParentUpdatePreview } from "../parent-update-preview";

const steps = [
  {
    title: "Log your lesson",
    description:
      "Capture what you covered, what went well, and homework while it’s still fresh.",
  },
  {
    title: "Send a parent update",
    description:
      "Turn your notes into a clear update you can copy or share straight into WhatsApp, Messages, or email.",
  },
  {
    title: "Schedule the next lesson",
    description:
      "Add the next session straight away so it shows in your calendar, upcoming lessons, and your calendar feed.",
  },
  {
    title: "Everything stays organised",
    description:
      "Progress, payments, lesson history, and your schedule stay linked to each student automatically.",
  },
] as const;

const weekdayLabels = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
] as const;

function ScreenPreviewCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-base font-medium text-zinc-900">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">{children}</div>
    </article>
  );
}

function LessonFormPreview() {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="rounded-md border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lesson details</p>
          <span className="text-xs text-zinc-500">Harris</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-600">
            08 Apr 2026
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-600">
            17:00
          </div>
        </div>
        <div className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-zinc-600">
          Fractions, word problems, exam technique
        </div>
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Reflection</p>
        <div className="mt-2 space-y-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-zinc-600">
            Strong work explaining methods clearly
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">Student effort</p>
            <p className="text-xs font-medium text-zinc-700">4/5</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <span
                key={item}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium ${
                  item === 4
                    ? "border-zinc-700 bg-zinc-100 text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-500"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Active students", "12"],
          ["This month", "£640"],
          ["Unpaid", "£120"],
          ["Upcoming", "3"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-zinc-200 bg-white p-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Upcoming lessons</p>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <div>
              <p className="font-medium text-zinc-900">Harris</p>
              <p className="text-xs text-zinc-500">Tue 8 Apr · 16:00</p>
            </div>
            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-white">
              Complete
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <div>
              <p className="font-medium text-zinc-900">Ava</p>
              <p className="text-xs text-zinc-500">Wed 9 Apr · 17:00</p>
            </div>
            <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700">
              Scheduled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {weekdayLabels.map((day) => (
          <div key={day.key} className="py-1">
            {day.label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 14 }).map((_, index) => {
          const day = index + 7;
          const hasLesson = [8, 10, 12, 14, 19].includes(day);
          const selected = day === 8;
          return (
            <div
              key={day}
              className={`rounded-md border p-2 text-center text-xs ${
                selected
                  ? "border-zinc-700 bg-zinc-100 text-zinc-900"
                  : hasLesson
                    ? "border-zinc-300 bg-zinc-50 text-zinc-700"
                    : "border-zinc-200 bg-white text-zinc-500"
              }`}
            >
              <div className="font-medium">{day}</div>
              {hasLesson ? <div className="mt-1 text-[10px]">{selected ? "2" : "•"}</div> : null}
            </div>
          );
        })}
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-3">
        <p className="font-medium text-zinc-900">Lessons on Tue 8 April</p>
        <div className="mt-2 space-y-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-zinc-900">16:00 · Harris</p>
            <p className="text-xs text-zinc-500">Planned</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-zinc-900">17:30 · Ava</p>
            <p className="text-xs text-zinc-500">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6 py-6 sm:space-y-8 sm:py-10">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Tutor Flow
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          How Tutor Flow works
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
          Everything you do after a lesson — captured in one simple flow.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">A simple workflow</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Four steps that keep notes, follow-up, scheduling, and admin connected.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-base font-medium text-zinc-900">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">Example parent update</h2>
        <p className="mt-1 text-sm text-zinc-600">
          This is the kind of clear, parent-friendly update you can send after each lesson.
        </p>
        <ParentUpdatePreview defaultOpen hideToggle />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">Product previews</h2>
        <p className="mt-1 text-sm text-zinc-600">
          A quick look at the lesson form, dashboard, and calendar views tutors use day to day.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ScreenPreviewCard
            title="Lesson form"
            subtitle="Log the lesson while everything is still fresh — ready to turn into a parent update."
          >
            <LessonFormPreview />
          </ScreenPreviewCard>
          <ScreenPreviewCard
            title="Dashboard"
            subtitle="See what needs attention today — upcoming lessons, unpaid sessions, and recent activity."
          >
            <DashboardPreview />
          </ScreenPreviewCard>
          <ScreenPreviewCard
            title="Calendar"
            subtitle="Keep upcoming and completed lessons organised by date — synced with your calendar."
          >
            <CalendarPreview />
          </ScreenPreviewCard>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">Helpful resources for tutors</h2>
        <p className="mt-1 text-sm text-zinc-600">
          If you want a few practical starting points, these guides go deeper on lesson notes,
          parent updates, and payment tracking.
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

      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Ready to try it?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Start with one student, log one lesson — the rest follows.
        </p>
        <p className="mt-2 text-sm text-zinc-500">Takes less than 2 minutes to get started.</p>
        <div className="mt-5">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Get started
          </Link>
        </div>
      </section>
    </section>
  );
}
