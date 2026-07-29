import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  accountEmailErrorMessage,
  passwordResetErrorMessage,
  safeAuthNextPath,
  validateEmailChange,
} from "./account-security";

const controlsSource = readFileSync(
  new URL(
    "../app/(authed)/app/settings/components/account-security-controls.tsx",
    import.meta.url,
  ),
  "utf8",
);
const settingsSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const callbackSource = readFileSync(
  new URL("../app/auth/callback/route.ts", import.meta.url),
  "utf8",
);
const resetSource = readFileSync(
  new URL("../app/auth/reset/page.tsx", import.meta.url),
  "utf8",
);

test("email change requires a different, matching pair of addresses", () => {
  assert.deepEqual(
    validateEmailChange("owner@example.test", "", ""),
    { ok: false, error: "Enter and confirm your new email address." },
  );
  assert.deepEqual(
    validateEmailChange(
      "owner@example.test",
      "OWNER@example.test",
      "OWNER@example.test",
    ),
    { ok: false, error: "Enter a different email address." },
  );
  assert.deepEqual(
    validateEmailChange(
      "owner@example.test",
      "new@example.test",
      "other@example.test",
    ),
    { ok: false, error: "The new email addresses do not match." },
  );
  assert.deepEqual(
    validateEmailChange(
      "owner@example.test",
      "  new@example.test ",
      "new@example.test",
    ),
    { ok: true, email: "new@example.test" },
  );
});

test("Auth errors are converted into safe and useful account messages", () => {
  assert.equal(
    accountEmailErrorMessage("email rate limit exceeded"),
    "Too many email requests. Please wait before trying again.",
  );
  assert.equal(
    accountEmailErrorMessage("User already registered"),
    "That email address cannot be used. Try another address.",
  );
  assert.equal(
    accountEmailErrorMessage("database internals"),
    "We couldn’t start the email change. Please try again.",
  );
  assert.equal(
    passwordResetErrorMessage("rate limit exceeded"),
    "Too many reset emails have been requested. Please wait before trying again.",
  );
  assert.equal(
    passwordResetErrorMessage("SMTP provider internals"),
    "We couldn’t send the password reset email. Please try again.",
  );
});

test("Auth callback navigation accepts local paths and rejects redirect bypasses", () => {
  assert.equal(
    safeAuthNextPath("/app/settings?email_changed=1"),
    "/app/settings?email_changed=1",
  );
  assert.equal(safeAuthNextPath("//evil.example/path"), "/app/dashboard");
  assert.equal(safeAuthNextPath("/\\evil.example/path"), "/app/dashboard");
  assert.equal(safeAuthNextPath("https://evil.example"), "/app/dashboard");
  assert.equal(safeAuthNextPath(null), "/app/dashboard");
});

test("Settings exposes session-bound password and email controls without an admin client", () => {
  assert.match(settingsSource, /<AccountSecurityControls accountEmail=\{user\.email\}/);
  assert.match(controlsSource, /Send password reset email/);
  assert.match(controlsSource, /Change email address/);
  assert.match(controlsSource, /resetPasswordForEmail\(accountEmail/);
  assert.match(controlsSource, /supabase\.auth\.updateUser/);
  assert.match(controlsSource, /emailRedirectTo/);
  assert.doesNotMatch(controlsSource, /createSupabaseAdminClient/);
  assert.match(controlsSource, /pagehide/);
  assert.match(controlsSource, /popstate/);
  assert.match(controlsSource, /role="status"/);
  assert.match(controlsSource, /role="alert"/);
});

test("the callback uses the shared safe local-path validator", () => {
  assert.match(callbackSource, /safeAuthNextPath\(next\)/);
  assert.doesNotMatch(callbackSource, /next\.startsWith\("\/"\)/);
});

test("password reset fields clear on page lifecycle and history restoration", () => {
  assert.match(resetSource, /addEventListener\("pagehide", clearSensitiveResetState\)/);
  assert.match(resetSource, /addEventListener\("popstate", clearSensitiveResetState\)/);
  assert.match(resetSource, /setPassword\(""\)/);
  assert.match(resetSource, /setConfirmPassword\(""\)/);
});
