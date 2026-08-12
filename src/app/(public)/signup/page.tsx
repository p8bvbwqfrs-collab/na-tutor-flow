import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginClient } from "../login/login-client";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

function SignupFallback() {
  return (
    <section className="mx-auto max-w-md py-10 sm:py-16">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-zinc-600">Loading signup…</p>
      </div>
    </section>
  );
}

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <Suspense fallback={<SignupFallback />}>
      <LoginClient mode="sign_up" />
    </Suspense>
  );
}
