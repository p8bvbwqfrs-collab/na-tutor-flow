import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white text-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="NA's Tutor Flow home"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-800" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">NA&apos;s</span>
            <span className="text-lg font-semibold tracking-tight text-zinc-900 underline-offset-4 group-hover:underline">
              Tutor Flow
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6">{children}</main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Tutor Flow</p>
          <div className="flex items-center gap-4">
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
    </div>
  );
}
