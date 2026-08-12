import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { TutorFlowBrand } from "@/components/tutor-flow-brand";
import { AuthedNav } from "./components/authed-nav";
import { LogoutButton } from "./components/logout-button";
import { NavigationFeedbackProvider } from "./components/navigation-feedback-provider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationFeedbackProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 text-zinc-900 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <TutorFlowBrand
                  href="/app/dashboard"
                  label="Tutor Flow dashboard"
                  compact
                />
                <LogoutButton />
              </div>
              <AuthedNav />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
        <SiteFooter brandHref="/app/dashboard" brandLabel="Tutor Flow dashboard" />
      </div>
    </NavigationFeedbackProvider>
  );
}
