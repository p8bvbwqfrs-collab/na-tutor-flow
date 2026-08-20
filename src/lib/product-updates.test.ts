import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LATEST_PRODUCT_UPDATE_DATE, PRODUCT_UPDATES } from "./product-updates";

const updatesPageSource = readFileSync(
  new URL("../app/(public)/updates/page.tsx", import.meta.url),
  "utf8",
);
const settingsSource = readFileSync(
  new URL("../app/(authed)/app/settings/page.tsx", import.meta.url),
  "utf8",
);
const footerSource = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
const sitemapSource = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
const repositoryGuidance = readFileSync(new URL("../../AGENTS.md", import.meta.url), "utf8");

test("product updates are complete, unique and newest first", () => {
  assert.ok(PRODUCT_UPDATES.length >= 3);
  assert.equal(LATEST_PRODUCT_UPDATE_DATE, PRODUCT_UPDATES[0].date);

  const dates = PRODUCT_UPDATES.map((update) => update.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.equal(new Set(PRODUCT_UPDATES.map((update) => `${update.date}-${update.title}`)).size, PRODUCT_UPDATES.length);

  for (const update of PRODUCT_UPDATES) {
    assert.match(update.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(update.title.trim());
    assert.ok(update.summary.trim());
    assert.ok(update.changes.length > 0);
    assert.ok(update.changes.every((change) => change.trim().length > 0));
  }
});

test("the public page is discoverable without cluttering primary navigation", () => {
  assert.match(updatesPageSource, /PRODUCT_UPDATES\.map/);
  assert.match(updatesPageSource, /dateTime=\{update\.date\}/);
  assert.match(updatesPageSource, /routine maintenance and sensitive security details are intentionally left out/);
  assert.match(footerSource, /href="\/updates"/);
  assert.match(footerSource, /What&apos;s new/);
  assert.match(settingsSource, /href="\/updates"/);
  assert.match(settingsSource, /Recent improvements/);
  assert.match(sitemapSource, /LATEST_PRODUCT_UPDATE_DATE/);
  assert.match(sitemapSource, /url: `\$\{baseUrl\}\/updates`/);
});

test("future user-facing releases carry an explicit update requirement", () => {
  assert.match(repositoryGuidance, /Before releasing a user-facing production change/);
  assert.match(repositoryGuidance, /src\/lib\/product-updates\.ts/);
  assert.match(repositoryGuidance, /Keep entries newest first/);
  assert.match(repositoryGuidance, /Do not include commit hashes/);
  assert.match(repositoryGuidance, /Purely internal maintenance does not need a public update entry/);
});
