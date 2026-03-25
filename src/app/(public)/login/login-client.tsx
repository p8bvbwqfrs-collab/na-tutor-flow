"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "sign_in" | "sign_up";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");
  const [authMode, setAuthMode] = useState<AuthMode>("sign_in");
  const [showOtpFallback, setShowOtpFallback] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const formErrorId = "login-form-error";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [cooldownSeconds]);

  function startCooldown() {
    setCooldownSeconds(60);
  }

  async function handleForgotPasswordClick() {
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email first, then try Forgot password.");
      return;
    }

    setIsResetSending(true);

    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("Check your email to reset your password.");
    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setIsResetSending(false);
    }
  }

  async function onPrimarySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsAuthSubmitting(true);

    try {
      if (authMode === "sign_in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }
      }

      router.push("/app/dashboard");
      router.refresh();
    } catch {
      setError("Unable to complete authentication. Please try again.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function sendCode() {
    setError(null);
    setMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    setIsSending(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (signInError) {
        if (/rate limit/i.test(signInError.message)) {
          setError("Too many requests. Please wait a bit and try again.");
          startCooldown();
          return;
        }

        setError(signInError.message);
        return;
      }

      setIsCodeSent(true);
      setMessage("Check your email for a sign-in link (or code).");
      setCode("");
      startCooldown();
    } catch {
      setError("Unable to send code. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyClick() {
    setError(null);
    setMessage(null);
    setIsVerifying(true);

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      setIsVerifying(false);
      return;
    }

    if (!/^\d{6,8}$/.test(trimmedCode)) {
      setError("Enter the code from your email.");
      setIsVerifying(false);
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedCode,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        setIsVerifying(false);
        return;
      }

      router.push("/app/dashboard");
      router.refresh();
    } catch {
      setError("Unable to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  function onEmailChange(value: string) {
    setEmail(value);
    setError(null);
    setMessage(null);
  }

  function onPasswordChange(value: string) {
    setPassword(value);
    setError(null);
    setMessage(null);
  }

  function onCodeChange(value: string) {
    setCode(value.replace(/\D/g, "").slice(0, 8));
    setError(null);
    setMessage(null);
  }

  return (
    <section className="mx-auto max-w-md py-10 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {authMode === "sign_in" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        {authMode === "sign_in"
          ? "Sign in with your email and password."
          : "Create your account with your email and password."}
      </p>

      <form
        onSubmit={onPrimarySubmit}
        className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? formErrorId : undefined}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={authMode === "sign_in" ? "current-password" : "new-password"}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? formErrorId : undefined}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
            placeholder="Minimum 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={isAuthSubmitting || isResetSending || isSending || isVerifying}
          className="inline-flex w-full items-center justify-center rounded-md bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
        >
          {isAuthSubmitting
            ? authMode === "sign_in"
              ? "Signing in..."
              : "Creating account..."
            : authMode === "sign_in"
              ? "Sign in"
              : "Create account"}
        </button>

        {authMode === "sign_in" ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">Password must be at least 8 characters.</p>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              disabled={isAuthSubmitting || isResetSending || isSending || isVerifying}
              className="text-sm font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              {isResetSending ? "Sending reset email..." : "Forgot password?"}
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Use at least 8 characters for your password.</p>
        )}
      </form>

      <div className="mt-3 text-sm">
        {authMode === "sign_in" ? (
          <button
            type="button"
            onClick={() => {
              setAuthMode("sign_up");
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
          >
            Need an account? Create one
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuthMode("sign_in");
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4">
        <p className="text-sm font-medium text-zinc-900">Prefer a one-time code?</p>
        <p className="mt-1 text-sm text-zinc-600">
          Use email and password as the main sign-in method. A one-time code is available if needed.
        </p>
        <button
          type="button"
          onClick={() => setShowOtpFallback((prev) => !prev)}
          className="mt-2 text-sm font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
        >
          {showOtpFallback ? "Hide one-time code option" : "Use a one-time code instead"}
        </button>

        {showOtpFallback ? (
          <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-700">
              If your email includes a code, enter it here. Otherwise, click the link.
            </p>

            <button
              type="button"
              onClick={sendCode}
              disabled={isSending || isVerifying || isAuthSubmitting || cooldownSeconds > 0}
              className="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-600"
            >
              {isSending ? "Sending..." : isCodeSent ? "Resend code" : "Send code"}
            </button>

            {isCodeSent ? (
              <>
                <label htmlFor="otp_code" className="block text-sm font-medium text-zinc-700">
                  Code from email
                </label>
                <input
                  id="otp_code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? formErrorId : undefined}
                  value={code}
                  onChange={(event) => onCodeChange(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
                  placeholder="12345678"
                />
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  disabled={
                    isVerifying ||
                    isSending ||
                    isAuthSubmitting ||
                    !/^\d{6,8}$/.test(code.trim()) ||
                    !email.trim()
                  }
                  className="inline-flex w-full items-center justify-center rounded-md bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
                >
                  {isVerifying ? "Verifying..." : "Verify code"}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {cooldownSeconds > 0 ? (
        <p role="status" className="mt-3 text-sm text-zinc-700">
          You can resend in {cooldownSeconds}s
        </p>
      ) : null}

      {message ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          id={formErrorId}
          role="alert"
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          Back to home
        </Link>
      </div>
    </section>
  );
}
