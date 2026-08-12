import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("shared shells use one Tutor Flow identity without the former NA prefix", () => {
  const publicLayout = read("src/app/(public)/layout.tsx");
  const authedLayout = read("src/app/(authed)/layout.tsx");
  const brand = read("src/components/tutor-flow-brand.tsx");

  assert.match(publicLayout, /TutorFlowBrand/);
  assert.match(authedLayout, /TutorFlowBrand/);
  assert.doesNotMatch(publicLayout, /NA Tutor Flow|>NA</);
  assert.doesNotMatch(authedLayout, /NA(?:&apos;|'s)/);
  assert.match(brand, /Tutor <span className="text-blue-700">Flow/);
  assert.match(brand, /aria-hidden="true"/);
});

test("public navigation keeps conversion and account actions available on mobile", () => {
  const publicLayout = read("src/app/(public)/layout.tsx");

  assert.match(publicLayout, /href="\/login"/);
  assert.match(publicLayout, /href="\/signup"/);
  assert.match(publicLayout, /Start free/);
  assert.match(publicLayout, /min-h-10/);
  assert.match(publicLayout, /max-sm:hidden/);
});

test("the design system defines reusable foundations and interaction patterns", () => {
  const css = read("src/app/globals.css");
  const patterns = read("src/lib/ui-patterns.ts");
  const documentation = read("docs/design-system.md");

  for (const token of [
    "--tf-brand",
    "--tf-canvas",
    "--tf-surface",
    "--tf-border",
    "--radius-control",
    "--radius-panel",
    "--shadow-panel",
  ]) {
    assert.ok(css.includes(token), "Expected design token " + token);
  }

  for (const pattern of [
    "primaryAction",
    "secondaryAction",
    "quietAction",
    "fieldControl",
    "surfacePanel",
  ]) {
    assert.ok(patterns.includes("export const " + pattern), "Expected UI pattern " + pattern);
  }

  assert.match(documentation, /Start at 320px/);
  assert.match(documentation, /touch and keyboard/);
  assert.match(documentation, /Do not expose student, parent, lesson or payment data in analytics/);
});

test("the shared footer carries a restrained current-year copyright notice", () => {
  const footer = read("src/components/site-footer.tsx");

  assert.match(footer, /© \{new Date\(\)\.getFullYear\(\)\} Tutor Flow/);
  assert.doesNotMatch(footer, /All rights reserved/);
});
