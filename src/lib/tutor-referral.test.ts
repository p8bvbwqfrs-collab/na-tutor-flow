import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shareSource = readFileSync(
  new URL("../app/(authed)/app/settings/components/share-tutor-flow.tsx", import.meta.url),
  "utf8",
);
const settingsSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const analyticsSource = readFileSync(new URL("./product-analytics.ts", import.meta.url), "utf8");

test("Settings offers a restrained tutor-to-tutor referral path", () => {
  assert.match(settingsSource, /<ShareTutorFlow \/>/);
  assert.match(shareSource, /Know another independent tutor\?/);
  assert.match(shareSource, /Nothing is sent automatically/);
  assert.match(shareSource, /free for early adopters/);
  assert.match(shareSource, /https:\/\/www\.natutorflow\.com/);
  assert.doesNotMatch(shareSource, /email address|phone number|recipient/i);
});

test("the referral message remains editable, accessible and mobile friendly", () => {
  assert.match(shareSource, /aria-expanded=\{isOpen\}/);
  assert.match(shareSource, /aria-controls=\{panelId\}/);
  assert.match(shareSource, /htmlFor="tutor-flow-share-message"/);
  assert.match(shareSource, /role="status" aria-live="polite"/);
  assert.match(shareSource, /w-full shrink-0/);
  assert.match(shareSource, /sm:w-auto/);
});

test("sharing is tutor controlled with copy fallback and privacy-safe analytics", () => {
  assert.match(shareSource, /navigator\.share/);
  assert.match(shareSource, /navigator\.clipboard\.writeText\(message\)/);
  assert.match(shareSource, /AbortError/);
  assert.match(shareSource, /trackActivationStep\("tutor_flow_shared"\)/);
  assert.match(analyticsSource, /\| "tutor_flow_shared"/);
});
