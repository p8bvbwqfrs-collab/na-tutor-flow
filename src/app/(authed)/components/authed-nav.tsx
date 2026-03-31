"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-900 hover:bg-zinc-50 hover:underline"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
