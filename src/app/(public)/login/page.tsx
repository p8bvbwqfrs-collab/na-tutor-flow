import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

function LoginFallback() {
  return (
    <section className="mx-auto max-w-md py-10 sm:py-16">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-zinc-600">Loading login...</p>
      </div>
    </section>
  );
}

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient mode="sign_in" />
    </Suspense>
  );
}
