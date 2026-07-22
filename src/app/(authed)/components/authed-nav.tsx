"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (!isNavigating || !pendingHref) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowProgress(true), 300);
    return () => window.clearTimeout(timeoutId);
  }, [isNavigating, pendingHref]);

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (isNavigating) {
      event.preventDefault();
      return;
    }

    if (isActivePath(pathname, href)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setShowProgress(false);
    setPendingHref(href);
    startNavigation(() => router.push(href));
  }

  return (
    <div className="relative">
      <nav className="flex flex-wrap items-center gap-2" aria-label="Authenticated navigation">
        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const isDestinationPending = isNavigating && pendingHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavigation(event, item.href)}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isNavigating || undefined}
              aria-busy={isDestinationPending || undefined}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-900 hover:bg-zinc-50 hover:underline"
              } ${isNavigating ? "cursor-wait" : ""}`}
            >
              {showProgress && isDestinationPending ? (
                <span
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
                  aria-hidden="true"
                />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {showProgress && isNavigating && pendingHref ? (
        <>
          <div className="absolute -bottom-3 left-0 h-0.5 w-full overflow-hidden bg-zinc-100" aria-hidden="true">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-500" />
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            Loading {navItems.find((item) => item.href === pendingHref)?.label ?? "page"}…
          </p>
        </>
      ) : null}
    </div>
  );
}
