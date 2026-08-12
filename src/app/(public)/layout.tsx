import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { TutorFlowBrand } from "@/components/tutor-flow-brand";
import { primaryAction, quietAction } from "@/lib/ui-patterns";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 text-zinc-900 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
          <TutorFlowBrand
            href="/"
            label="Tutor Flow home"
            compact
          />
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            <Link
              href="/how-it-works"
              className={quietAction + " max-sm:hidden"}
            >
              How it works
            </Link>
            <Link
              href="/resources"
              className={quietAction + " max-sm:hidden"}
            >
              Resources
            </Link>
            <Link
              href="/login"
              className={quietAction}
            >
              Login
            </Link>
            <Link href="/signup" className={`${primaryAction} min-h-10 px-3 sm:px-4`}>
              <span className="sm:hidden">Start free</span>
              <span className="max-sm:hidden">Get started free</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
