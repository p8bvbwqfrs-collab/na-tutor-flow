import Link from "next/link";

type SiteFooterProps = {
  className?: string;
  containerClassName?: string;
};

export function SiteFooter({
  className = "border-t border-zinc-200 bg-white",
  containerClassName = "mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between",
}: SiteFooterProps) {
  return (
    <footer className={className}>
      <div className={containerClassName}>
        <p>Tutor Flow</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/about"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
