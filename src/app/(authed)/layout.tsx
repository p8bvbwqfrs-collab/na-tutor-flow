import Link from "next/link";
import { AuthedNav } from "./components/authed-nav";
import { LogoutButton } from "./components/logout-button";

export default function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white text-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/app/dashboard"
                className="group inline-flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                aria-label="NA's Tutor Flow dashboard"
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-800" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">NA&apos;s</span>
                <span className="text-lg font-semibold tracking-tight text-zinc-900 underline-offset-4 group-hover:underline">
                  Tutor Flow
                </span>
              </Link>
              <LogoutButton />
            </div>
            <AuthedNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
