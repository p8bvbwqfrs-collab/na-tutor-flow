export const AUTH_DEFAULT_NEXT_PATH = "/app/dashboard";

export function safeAuthNextPath(
  next: string | null | undefined,
  fallback = AUTH_DEFAULT_NEXT_PATH,
) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }

  try {
    const baseUrl = new URL("https://tutor-flow.invalid");
    const resolved = new URL(next, baseUrl);

    if (resolved.origin !== baseUrl.origin) {
      return fallback;
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

export type EmailChangeValidationResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

export function validateEmailChange(
  currentEmail: string,
  newEmail: string,
  confirmedEmail: string,
): EmailChangeValidationResult {
  const trimmedNewEmail = newEmail.trim();
  const trimmedConfirmedEmail = confirmedEmail.trim();

  if (!trimmedNewEmail || !trimmedConfirmedEmail) {
    return { ok: false, error: "Enter and confirm your new email address." };
  }

  if (trimmedNewEmail.toLocaleLowerCase() === currentEmail.toLocaleLowerCase()) {
    return { ok: false, error: "Enter a different email address." };
  }

  if (trimmedNewEmail !== trimmedConfirmedEmail) {
    return { ok: false, error: "The new email addresses do not match." };
  }

  return { ok: true, email: trimmedNewEmail };
}

export function accountEmailErrorMessage(rawMessage: string) {
  if (/rate.?limit|too many/i.test(rawMessage)) {
    return "Too many email requests. Please wait before trying again.";
  }

  if (/invalid.*email|email.*invalid/i.test(rawMessage)) {
    return "Enter a valid email address.";
  }

  if (/already.*registered|already.*exists|email.*taken/i.test(rawMessage)) {
    return "That email address cannot be used. Try another address.";
  }

  return "We couldn’t start the email change. Please try again.";
}

export function passwordResetErrorMessage(rawMessage: string) {
  if (/rate.?limit|too many/i.test(rawMessage)) {
    return "Too many reset emails have been requested. Please wait before trying again.";
  }

  return "We couldn’t send the password reset email. Please try again.";
}
