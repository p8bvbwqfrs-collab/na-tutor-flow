import Link from "next/link";
import { TutorFlowBrand } from "@/components/tutor-flow-brand";

type SiteFooterProps = {
  className?: string;
  containerClassName?: string;
  brandHref?: string;
  brandLabel?: string;
};

export function SiteFooter({
  className = "border-t border-zinc-200 bg-white",
  containerClassName = "mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between",
  brandHref = "/",
  brandLabel = "Tutor Flow home",
}: SiteFooterProps) {
  return (
    <footer className={className}>
      <div className={containerClassName}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TutorFlowBrand href={brandHref} label={brandLabel} compact />
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} Tutor Flow</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/resources"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Resources
          </Link>
          <Link
            href="/maths-tutor"
            className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Maths tutoring
          </Link>
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
