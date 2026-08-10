import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sharedPageSource = readFileSync(
  "src/app/(public)/components/public-content-page.tsx",
  "utf8",
);
const actionsSource = readFileSync(
  "src/app/(public)/components/resource-actions.tsx",
  "utf8",
);
const paymentSource = readFileSync(
  "src/app/(public)/tutor-payment-tracker/page.tsx",
  "utf8",
);
const lessonNotesSource = readFileSync(
  "src/app/(public)/tutor-lesson-notes-template/page.tsx",
  "utf8",
);
const parentUpdatesSource = readFileSync(
  "src/app/(public)/how-to-write-parent-updates-after-tutoring/page.tsx",
  "utf8",
);
const resourceIndexSource = readFileSync("src/app/(public)/resources/page.tsx", "utf8");

test("resource pages use a compact header and one divided article surface", () => {
  assert.match(sharedPageSource, /category: string/);
  assert.match(sharedPageSource, /primaryAction: ReactNode/);
  assert.match(sharedPageSource, /<article className="divide-y divide-zinc-200/);
  assert.match(sharedPageSource, /Built from real private tutoring workflows/);
  assert.match(sharedPageSource, /Reviewed August 2026/);
  assert.doesNotMatch(
    sharedPageSource,
    /function PublicSection[\s\S]*?<section className="rounded-lg border/,
  );
});

test("each resource puts its most useful action above the article", () => {
  assert.match(paymentSource, /action="download_csv"/);
  assert.match(paymentSource, /download/);
  assert.match(lessonNotesSource, /action="copy_template"/);
  assert.match(lessonNotesSource, /copyText=\{lessonNotesTemplate\}/);
  assert.match(parentUpdatesSource, /action="copy_example"/);
  assert.match(parentUpdatesSource, /copyText=\{parentUpdateExample\}/);
});

test("resource actions are measured without making analytics a dependency", () => {
  assert.match(actionsSource, /track\("resource_action", \{ resource, action \}\)/);
  assert.match(actionsSource, /Analytics must never prevent/);
  assert.match(actionsSource, /navigator\.clipboard\.writeText\(copyText\)/);
  assert.match(actionsSource, /aria-live="polite"/);
  assert.match(actionsSource, /Copy unavailable/);
});

test("all resource FAQs use accessible native disclosures", () => {
  assert.match(sharedPageSource, /<details/);
  assert.match(sharedPageSource, /<summary/);
  assert.match(paymentSource, /<PublicFaqSection/);
  assert.match(lessonNotesSource, /<PublicFaqSection/);
  assert.match(parentUpdatesSource, /<PublicFaqSection/);
});

test("the resources index uses the shared brand and workflow-led cards", () => {
  assert.match(resourceIndexSource, /Start with what you need/);
  assert.match(resourceIndexSource, /<ResourceCardLink/);
  assert.match(resourceIndexSource, /Copyable template/);
  assert.match(resourceIndexSource, /Copyable example/);
  assert.match(resourceIndexSource, /Free CSV template/);
  assert.match(resourceIndexSource, /md:grid-cols-3/);
  assert.match(resourceIndexSource, /resource="resource-index"/);
  assert.match(actionsSource, /action: `open_\$\{resource\}`/);
  assert.match(actionsSource, /<h3 className=/);
});
