"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  accountEmailErrorMessage,
  passwordResetErrorMessage,
  validateEmailChange,
} from "@/lib/account-security";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AccountSecurityControlsProps = {
  accountEmail: string;
};

export function AccountSecurityControls({ accountEmail }: AccountSecurityControlsProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailErrorRef = useRef<HTMLParagraphElement>(null);
  const [isResetSending, setIsResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (isChangingEmail) {
      emailInputRef.current?.focus();
    }
  }, [isChangingEmail]);

  useEffect(() => {
    if (emailError) {
      emailErrorRef.current?.focus();
    }
  }, [emailError]);

  useEffect(() => {
    function clearAccountDraft() {
      setNewEmail("");
      setConfirmedEmail("");
      setEmailError(null);
      setEmailMessage(null);
      setIsChangingEmail(false);
    }

    window.addEventListener("pagehide", clearAccountDraft);
    window.addEventListener("popstate", clearAccountDraft);

    return () => {
      window.removeEventListener("pagehide", clearAccountDraft);
      window.removeEventListener("popstate", clearAccountDraft);
    };
  }, []);

  function closeEmailForm() {
    if (isEmailSubmitting) {
      return;
    }

    setIsChangingEmail(false);
    setNewEmail("");
    setConfirmedEmail("");
    setEmailMessage(null);
    setEmailError(null);
  }

  async function sendPasswordReset() {
    if (isResetSending || resetSent) {
      return;
    }

    setResetError(null);
    setIsResetSending(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(accountEmail, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) {
        setResetError(passwordResetErrorMessage(error.message));
        return;
      }

      setResetSent(true);
    } catch {
      setResetError("We couldn’t send the password reset email. Please try again.");
    } finally {
      setIsResetSending(false);
    }
  }

  async function submitEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isEmailSubmitting) {
      return;
    }

    setEmailError(null);
    setEmailMessage(null);

    const validation = validateEmailChange(accountEmail, newEmail, confirmedEmail);

    if (!validation.ok) {
      setEmailError(validation.error);
      return;
    }

    setIsEmailSubmitting(true);

    try {
      const settingsReturnPath = "/app/settings?email_changed=1";
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", settingsReturnPath);
      const { error } = await supabase.auth.updateUser(
        { email: validation.email },
        { emailRedirectTo: callbackUrl.toString() },
      );

      if (error) {
        setEmailError(accountEmailErrorMessage(error.message));
        return;
      }

      setNewEmail("");
      setConfirmedEmail("");
      setEmailMessage(
        "Confirmation instructions sent. Check your new inbox and, if prompted, your current inbox too.",
      );
    } catch {
      setEmailError("We couldn’t start the email change. Please try again.");
    } finally {
      setIsEmailSubmitting(false);
    }
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Password</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Send a secure password-reset link to your signed-in email address.
        </p>

        {resetSent ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          >
            Password reset email sent. Check your inbox and junk folder.
          </p>
        ) : null}

        {resetError ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          >
            {resetError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={sendPasswordReset}
          disabled={isResetSending || resetSent}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
        >
          {isResetSending
            ? "Sending reset email..."
            : resetSent
              ? "Reset email sent"
              : "Send password reset email"}
        </button>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Email address</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Change the email you use to sign in. The change only completes after confirmation.
        </p>

        {!isChangingEmail ? (
          <button
            type="button"
            onClick={() => {
              setIsChangingEmail(true);
              setEmailError(null);
              setEmailMessage(null);
            }}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Change email address
          </button>
        ) : (
          <form onSubmit={submitEmailChange} className="mt-4 space-y-3">
            <div>
              <label htmlFor="new-account-email" className="block text-sm font-medium text-zinc-800">
                New email
              </label>
              <input
                ref={emailInputRef}
                id="new-account-email"
                type="email"
                required
                autoComplete="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value);
                  setEmailError(null);
                  setEmailMessage(null);
                }}
                disabled={isEmailSubmitting}
                aria-describedby={emailError ? "account-email-error" : undefined}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-account-email"
                className="block text-sm font-medium text-zinc-800"
              >
                Confirm new email
              </label>
              <input
                id="confirm-account-email"
                type="email"
                required
                autoComplete="off"
                value={confirmedEmail}
                onChange={(event) => {
                  setConfirmedEmail(event.target.value);
                  setEmailError(null);
                  setEmailMessage(null);
                }}
                disabled={isEmailSubmitting}
                aria-describedby={emailError ? "account-email-error" : undefined}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100"
              />
            </div>

            {emailMessage ? (
              <p
                role="status"
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              >
                {emailMessage}
              </p>
            ) : null}

            {emailError ? (
              <p
                ref={emailErrorRef}
                id="account-email-error"
                role="alert"
                tabIndex={-1}
                className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 outline-none"
              >
                {emailError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEmailForm}
                disabled={isEmailSubmitting}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isEmailSubmitting ? "Sending confirmation..." : "Send confirmation"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
