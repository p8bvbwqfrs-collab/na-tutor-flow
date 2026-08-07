import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getNavigationDestination } from "./navigation-feedback";

const origin = "https://www.natutorflow.com";
const providerSource = readFileSync(
  new URL(
    "../app/(authed)/components/navigation-feedback-provider.tsx",
    import.meta.url,
  ),
  "utf8",
);
const navSource = readFileSync(
  new URL("../app/(authed)/components/authed-nav.tsx", import.meta.url),
  "utf8",
);

test("internal app destinations receive useful tutor-facing labels", () => {
  const current = `${origin}/app/dashboard`;

  assert.equal(
    getNavigationDestination("/app/students", current, origin)?.label,
    "Students",
  );
  assert.equal(
    getNavigationDestination("/app/students/123/new-lesson", current, origin)?.label,
    "Log lesson",
  );
  assert.equal(
    getNavigationDestination("/app/students/123/schedule-lesson", current, origin)?.label,
    "Schedule lesson",
  );
  assert.equal(
    getNavigationDestination("/app/students/123/lessons/456/view", current, origin)?.label,
    "Lesson notes",
  );
  assert.equal(
    getNavigationDestination("/app/calendar?month=2026-09", current, origin)?.label,
    "Calendar",
  );
});

test("external, non-app and current-page links are not treated as app transitions", () => {
  const current = `${origin}/app/settings`;

  assert.equal(getNavigationDestination("https://example.com/app", current, origin), null);
  assert.equal(getNavigationDestination("/apple", current, origin), null);
  assert.equal(getNavigationDestination("/privacy", current, origin), null);
  assert.equal(getNavigationDestination("/app/settings#data", current, origin), null);
});

test("navigation feedback waits, stays accessible and blocks only duplicate activation", () => {
  assert.match(providerSource, /window\.setTimeout\(\(\) => setShowProgress\(true\), 300\)/);
  assert.match(providerSource, /document\.addEventListener\("click", handleDocumentClick, true\)/);
  assert.match(providerSource, /pendingDestination\?\.href === destination\.href/);
  assert.match(providerSource, /event\.preventDefault\(\)/);
  assert.match(providerSource, /role="status"/);
  assert.match(providerSource, /aria-live="polite"/);
  assert.match(providerSource, /Opening \{pendingDestination\.label\}/);
  assert.doesNotMatch(navSource, /useTransition|router\.push|aria-disabled/);
  assert.match(navSource, /aria-busy=\{isDestinationPending \|\| undefined\}/);
});
