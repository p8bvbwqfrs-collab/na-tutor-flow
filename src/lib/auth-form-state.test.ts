import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { clearAuthenticationDraft, type AuthenticationDraft } from "./auth-form-state";

const populatedDraft: AuthenticationDraft = {
  email: "saved@example.com",
  password: "sensitive-password",
  code: "123456",
  error: "Authentication failed",
  message: "Try again",
};

test("sign-in values do not carry into registration", () => {
  assert.deepEqual(clearAuthenticationDraft(populatedDraft), {
    email: "",
    password: "",
    code: "",
    error: null,
    message: null,
  });
});

test("registration values do not carry into sign-in", () => {
  assert.deepEqual(clearAuthenticationDraft(populatedDraft), clearAuthenticationDraft());
});

test("browser history restoration uses the sensitive-state clearing path", async () => {
  const source = await readFile("src/app/(public)/login/login-client.tsx", "utf8");

  assert.match(source, /addEventListener\("pagehide", clearOnHistoryNavigation\)/);
  assert.match(source, /addEventListener\("popstate", clearOnHistoryNavigation\)/);
  assert.match(source, /clearAuthenticationDraft\(\)/);
});

test("signup initially renders registration mode", async () => {
  const source = await readFile("src/app/(public)/signup/page.tsx", "utf8");

  assert.match(source, /<LoginClient mode="sign_up" \/>/);
});

test("homepage Get started free CTAs target signup", async () => {
  const source = await readFile("src/app/(public)/page.tsx", "utf8");
  const ctaCount = (source.match(/Get started free/g) ?? []).length;
  const signupHrefCount = (source.match(/href="\/signup"/g) ?? []).length;

  assert.equal(ctaCount, 2);
  assert.equal(signupHrefCount, 2);
});
