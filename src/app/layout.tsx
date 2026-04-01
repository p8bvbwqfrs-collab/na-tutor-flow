import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NA's Tutor Flow",
  description: "A simple tool for independent tutors to log lessons, update parents, and track payments.",
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
