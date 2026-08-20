"use client";

import { track } from "@vercel/analytics";
import { focusRing, primaryAction } from "@/lib/ui-patterns";

type MathsTuitionEnquiryLinkProps = {
  href: string;
  placement: "hero" | "footer";
  inverse?: boolean;
  children: React.ReactNode;
};

export function MathsTuitionEnquiryLink({
  href,
  placement,
  inverse = false,
  children,
}: MathsTuitionEnquiryLinkProps) {
  const className = inverse
    ? `inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-950 shadow-sm transition-colors hover:bg-blue-50 sm:w-auto ${focusRing} focus-visible:ring-blue-300 focus-visible:ring-offset-blue-950`
    : primaryAction + " w-full sm:w-auto";

  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        try {
          track("maths_tuition_enquiry", { placement });
        } catch {
          // Analytics must never prevent a family from opening their email client.
        }
      }}
    >
      {children}
    </a>
  );
}
