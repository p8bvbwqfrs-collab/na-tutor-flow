import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.natutorflow.com"),
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
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <main className="min-h-screen">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
