import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NEWSLETTER_ISSUES } from "./newsletter";

const newsletterIndex = readFileSync("src/app/(public)/newsletter/page.tsx", "utf8");
const newsletterIssue = readFileSync(
  "src/app/(public)/newsletter/five-minute-after-lesson-routine/page.tsx",
  "utf8",
);
const signup = readFileSync(
  "src/app/(public)/newsletter/newsletter-signup.tsx",
  "utf8",
);
const footer = readFileSync("src/components/site-footer.tsx", "utf8");
const resources = readFileSync("src/app/(public)/resources/page.tsx", "utf8");
const privacy = readFileSync("src/app/(public)/privacy/page.tsx", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
const repositoryGuidance = readFileSync("AGENTS.md", "utf8");
const authedLayout = readFileSync("src/app/(authed)/layout.tsx", "utf8");
const authedInvitation = readFileSync(
  "src/app/(authed)/components/newsletter-invitation.tsx",
  "utf8",
);
const authForm = readFileSync("src/app/(public)/login/login-client.tsx", "utf8");
const settings = readFileSync("src/app/(authed)/app/settings/page.tsx", "utf8");

test("newsletter issues are complete, unique and newest first", () => {
  assert.ok(NEWSLETTER_ISSUES.length > 0);
  assert.equal(new Set(NEWSLETTER_ISSUES.map((issue) => issue.slug)).size, NEWSLETTER_ISSUES.length);

  for (const issue of NEWSLETTER_ISSUES) {
    assert.ok(issue.slug);
    assert.ok(issue.title);
    assert.ok(issue.description);
    assert.match(issue.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(issue.readTime, /^\d+ min read$/);
  }

  const dates = NEWSLETTER_ISSUES.map((issue) => issue.publishedAt);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test("the archive and first issue are useful public reading experiences", () => {
  assert.match(newsletterIndex, /Every edition is free to read/);
  assert.match(newsletterIndex, /Written by Naz/);
  assert.match(newsletterIssue, /The five-step routine/);
  assert.match(newsletterIssue, /tutor lesson notes template/);
  assert.match(newsletterIssue, /parent update/);
  assert.match(newsletterIssue, /"@type": "Article"/);
  assert.doesNotMatch(newsletterIndex, /popup|modal/i);
});

test("newsletter discovery is consistent without cluttering primary navigation", () => {
  assert.match(footer, /href="\/newsletter"/);
  assert.match(resources, /<NewsletterSignup compact/);
  assert.match(sitemap, /NEWSLETTER_ISSUES/);
  assert.match(sitemap, /\/newsletter/);
});

test("signed-in tutors receive a dismissible consent-first newsletter invitation", () => {
  assert.match(authedLayout, /<NewsletterInvitation \/>/);
  assert.match(authedInvitation, /href="\/newsletter#newsletter-signup"/);
  assert.match(authedInvitation, /Join the newsletter/);
  assert.match(authedInvitation, /Not now/);
  assert.match(authedInvitation, /localStorage\.setItem/);
  assert.match(authedInvitation, /aria-labelledby="newsletter-invitation-heading"/);
  assert.doesNotMatch(authedInvitation, /supabase|user\.email|service_role/i);
});

test("account signup offers a separate, optional newsletter route without reusing the account email", () => {
  assert.match(authForm, /id="newsletter-interest"/);
  assert.match(authForm, /separate Tutor Flow Notes signup/);
  assert.match(authForm, /does not add your account email automatically/);
  assert.match(authForm, /newsletterInterest/);
  assert.match(authForm, /emailRedirectTo/);
  assert.match(authForm, /\/newsletter\?from=signup#newsletter-signup/);
  assert.doesNotMatch(authForm, /MAILERLITE_API|newsletter_consent/);
});

test("Settings keeps newsletter management separate and points to the consent form", () => {
  assert.match(settings, /title="Tutor Flow Notes"/);
  assert.match(settings, /Your account email is never added automatically/);
  assert.match(settings, /href="\/newsletter#newsletter-signup"/);
  assert.match(settings, /Join or manage newsletter/);
  assert.doesNotMatch(settings, /user\.email.*newsletter/i);
  assert.doesNotMatch(settings, /newsletter.*user\.email/i);
});

test("signup copy explains single opt-in consent and remains safe before provider connection", () => {
  assert.match(signup, /NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL/);
  assert.match(signup, /submitting the separate form/);
  assert.match(signup, /choosing to join Tutor Flow Notes/);
  assert.doesNotMatch(signup, /confirm by email/);
  assert.match(signup, /unsubscribe at any time/);
  assert.match(signup, /href="\/privacy"/);
  assert.match(signup, /Email sign-up is opening soon/);
  assert.match(privacy, /newsletter email address/);
  assert.match(privacy, /unsubscribe/);
});

test("newsletter publishing has a documented maintenance path", () => {
  assert.match(repositoryGuidance, /## Newsletter/);
  assert.match(repositoryGuidance, /NEWSLETTER_ISSUES/);
  assert.match(repositoryGuidance, /sitemap/);
  assert.match(repositoryGuidance, /genuinely new or meaningfully different practical idea/);
  assert.match(repositoryGuidance, /personal, informal voice/);
  assert.match(repositoryGuidance, /lightly humorous/);
});
