"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationFeedback } from "./navigation-feedback-provider";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/students", label: "Students" },
  { href: "/app/calendar", label: "Calendar" },
  { href: "/app/settings", label: "Settings" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AuthedNav() {
  const pathname = usePathname();
  const { pendingDestination, showProgress } = useNavigationFeedback();

  return (
    <div className="relative">
      <nav className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:items-center sm:gap-2" aria-label="Authenticated navigation">
        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const isDestinationPending = Boolean(
            pendingDestination && isActivePath(pendingDestination.pathname, item.href),
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-busy={isDestinationPending || undefined}
              className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:px-3 ${
                isActive
                  ? "bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-200"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              } ${isDestinationPending ? "cursor-wait" : ""}`}
            >
              {showProgress && isDestinationPending ? (
                <span
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700"
                  aria-hidden="true"
                />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
