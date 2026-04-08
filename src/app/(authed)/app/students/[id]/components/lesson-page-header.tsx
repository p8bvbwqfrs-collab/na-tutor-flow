import Link from "next/link";

type LessonPageHeaderProps = {
  studentName: string;
  pageLabel: string;
  backHref: string;
  metaLabel?: string;
};

export function LessonPageHeader({
  studentName,
  pageLabel,
  backHref,
  metaLabel,
}: LessonPageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-zinc-900">{studentName}</h1>
        <p className="mt-1 text-sm text-zinc-600">{pageLabel}</p>
        {metaLabel ? <p className="mt-1 text-sm text-zinc-500">{metaLabel}</p> : null}
      </div>
      <Link
        href={backHref}
        className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-fit"
      >
        Back to student
      </Link>
    </div>
  );
}
