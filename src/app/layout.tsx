import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.natutorflow.com"),
  applicationName: "Tutor Flow",
  title: {
    default: "Tutor Flow – Run your tutoring without the admin",
    template: "%s | Tutor Flow",
  },
  description: "Log lessons, send parent updates, and schedule sessions in one simple flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--tf-canvas)] text-zinc-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
