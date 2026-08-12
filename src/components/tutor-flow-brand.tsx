import Link from "next/link";

type TutorFlowBrandProps = {
  href: string;
  label: string;
  compact?: boolean;
  className?: string;
};

export function TutorFlowMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`${className} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" className="fill-blue-700" />
      <path
        d="M9 23V9H23M9 16H19"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="9" r="1.75" fill="white" />
      <circle cx="19" cy="16" r="1.75" fill="white" />
      <circle cx="9" cy="23" r="1.75" fill="white" />
    </svg>
  );
}

export function TutorFlowBrand({
  href,
  label,
  compact = false,
  className = "",
}: TutorFlowBrandProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${compact ? "gap-2" : "gap-2.5"} ${className}`}
    >
      <TutorFlowMark className={compact ? "h-7 w-7" : "h-8 w-8"} />
      <span
        className={`inline-flex items-center font-semibold leading-none tracking-[-0.025em] text-zinc-950 ${compact ? "text-base" : "text-lg"}`}
      >
        Tutor <span className="text-blue-700">Flow</span>
      </span>
    </Link>
  );
}
