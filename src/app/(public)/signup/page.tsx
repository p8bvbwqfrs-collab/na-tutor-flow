import { Suspense } from "react";
import { LoginClient } from "../login/login-client";

function SignupFallback() {
  return (
    <section className="mx-auto max-w-md py-10 sm:py-16">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-zinc-600">Loading signup…</p>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <LoginClient mode="sign_up" />
    </Suspense>
  );
}
