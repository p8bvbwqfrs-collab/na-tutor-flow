import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateTimeLocal } from "@/lib/datetime";
import { MarkPaidButton } from "./mark-paid-button";

type UnpaidLessonItem = {
  id: string;
  studentId: string;
  studentName: string;
  lessonAt: string;
  remainingPence: number;
};

type UnpaidLessonsSectionProps = {
  lessons: UnpaidLessonItem[];
  currencyCode: SupportedCurrencyCode;
  timeZone: string;
  hasDataError: boolean;
  hasAnyLessons: boolean;
};

export function UnpaidLessonsSection({
  lessons,
  currencyCode,
  timeZone,
  hasDataError,
  hasAnyLessons,
}: UnpaidLessonsSectionProps) {
  return (
    <section
      className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
      aria-labelledby="unpaid-lessons-heading"
    >
      <SectionHeading
        id="unpaid-lessons-heading"
        level={3}
        title="Unpaid lessons"
        description="Completed lessons with money still due. Mark a lesson as paid when the payment reaches you."
        headingClassName="text-lg font-medium text-zinc-900"
      />

      {hasDataError ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          Could not load dashboard data.
        </p>
      ) : lessons.length === 0 ? (
        hasAnyLessons ? (
          <p className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            No unpaid lessons.
          </p>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-900">Your dashboard will fill in as you go.</p>
            <p className="mt-2 text-sm text-zinc-600">
              Log your first lesson and we&apos;ll start showing payment tracking, recent activity, and earnings
              insights here.
            </p>
          </div>
        )
      ) : (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {lessons.map((lesson) => (
              <article key={lesson.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <Link
                  href={`/app/students/${lesson.studentId}`}
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  {lesson.studentName}
                </Link>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-zinc-500">Lesson</dt>
                    <dd className="mt-1 text-sm text-zinc-700">
                      {formatDateTimeLocal(lesson.lessonAt, timeZone)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Remaining</dt>
                    <dd className="mt-1 text-sm font-semibold text-amber-900">
                      {formatCurrencyFromMinorUnits(lesson.remainingPence, currencyCode)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 grid gap-2">
                  <Link
                    href={`/app/students/${lesson.studentId}/lessons/${lesson.id}/view`}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View notes
                  </Link>
                  <MarkPaidButton lessonId={lesson.id} />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Student
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Remaining
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, index) => (
                  <tr
                    key={lesson.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-zinc-50"} border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50`}
                  >
                    <td className="px-3 py-2.5 align-middle font-medium text-zinc-900">
                      <Link
                        href={`/app/students/${lesson.studentId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {lesson.studentName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-middle text-zinc-700">
                      {formatDateTimeLocal(lesson.lessonAt, timeZone)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-middle font-semibold text-zinc-900">
                      {formatCurrencyFromMinorUnits(lesson.remainingPence, currencyCode)}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start">
                        <Link
                          href={`/app/students/${lesson.studentId}/lessons/${lesson.id}/view`}
                          className="inline-flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                        >
                          View notes
                        </Link>
                        <MarkPaidButton lessonId={lesson.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
