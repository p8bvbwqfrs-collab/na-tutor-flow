"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    function clearSensitiveResetState() {
      setPassword("");
      setConfirmPassword("");
      setMessage(null);
      setError(null);
    }

    window.addEventListener("pagehide", clearSensitiveResetState);
    window.addEventListener("popstate", clearSensitiveResetState);

    return () => {
      window.removeEventListener("pagehide", clearSensitiveResetState);
      window.removeEventListener("popstate", clearSensitiveResetState);
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password updated. Redirecting to your dashboard...");
      router.push("/app/dashboard?password_reset=success");
      router.refresh();
    } catch {
      setError("Unable to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4">
      <section className="mx-auto max-w-md py-10 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Set new password</h1>
        <p className="mt-2 text-sm text-zinc-600">Choose a new password for your account.</p>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-700">
              Confirm password
            </label>
            <input
              id="confirm_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : undefined}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            />
          </div>

          <p className="text-xs text-zinc-500">Use at least 8 characters.</p>

          {message ? (
            <p
              role="status"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            >
              {message}
            </p>
          ) : null}

          {error ? (
            <p
              ref={errorRef}
              id="reset-password-error"
              role="alert"
              tabIndex={-1}
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 outline-none"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
          >
            {isSubmitting ? "Saving..." : "Set password"}
          </button>
        </form>
      </section>
    </main>
  );
}
