"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { focusRing, primaryAction } from "@/lib/ui-patterns";

type NewsletterActionLinkProps = {
  href: string;
  action: "open_issue" | "open_resource" | "start_free";
  children: React.ReactNode;
  variant?: "primary" | "text";
};

export function NewsletterActionLink({
  href,
  action,
  children,
  variant = "text",
}: NewsletterActionLinkProps) {
  const className =
    variant === "primary"
      ? `${primaryAction} w-full sm:w-auto`
      : `font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-700 ${focusRing}`;

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        try {
          track("newsletter_action", { action });
        } catch {
          // Reading and navigation must never depend on analytics.
        }
      }}
    >
      {children}
    </Link>
  );
}
