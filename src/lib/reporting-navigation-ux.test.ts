import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rangeFilterSource = readFileSync(
  "src/app/(authed)/app/dashboard/components/chart-range-filter.tsx",
  "utf8",
);
const dashboardSource = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");
const studentSource = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
const authedLayoutSource = readFileSync("src/app/(authed)/layout.tsx", "utf8");
const loginPageSource = readFileSync("src/app/(public)/login/page.tsx", "utf8");
const signupPageSource = readFileSync("src/app/(public)/signup/page.tsx", "utf8");

test("reporting periods are explicit and mobile friendly", () => {
  assert.match(rangeFilterSource, /Reporting period/);
  assert.match(rangeFilterSource, /<select/);
  assert.match(rangeFilterSource, /sm:hidden/);
  assert.match(rangeFilterSource, /hidden flex-wrap gap-2 sm:flex/);
  assert.match(rangeFilterSource, /<InfoDisclosure/);
  assert.match(dashboardSource, /student breakdown and the income chart below/);
  assert.match(studentSource, /payment history stay current/);
});

test("the dashboard visually groups the reporting period with its outputs", () => {
  assert.match(
    dashboardSource,
    /mt-6 rounded-xl border border-zinc-200 bg-zinc-50\/50 p-4 sm:p-5/,
  );
});

test("signed-in footer and auth-entry routes return users to the dashboard", () => {
  assert.match(authedLayoutSource, /brandHref="\/app\/dashboard"/);
  assert.match(authedLayoutSource, /brandLabel="Tutor Flow dashboard"/);
  for (const source of [loginPageSource, signupPageSource]) {
    assert.match(source, /supabase\.auth\.getUser\(\)/);
    assert.match(source, /redirect\("\/app\/dashboard"\)/);
  }
});

test("student pages do not retain a duplicate floating lesson action", () => {
  assert.doesNotMatch(studentSource, /fixed bottom-4 right-4/);
  assert.doesNotMatch(studentSource, />\s*\+ Lesson\s*</);
});
