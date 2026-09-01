import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const pageSource = readFileSync(
  path.join(
    repositoryRoot,
    "src/app/(public)/how-to-write-parent-updates-after-tutoring/page.tsx",
  ),
  "utf8",
);

test("the parent-update resource provides a free copyable template and realistic example", () => {
  assert.match(pageSource, /title: "Free Tutor Parent Update Template & Example"/);
  assert.match(pageSource, /Free copy-and-paste parent update template/);
  assert.match(pageSource, /copyText=\{parentUpdateTemplate\}/);
  assert.match(pageSource, /does not require an account/);
  assert.match(pageSource, /A realistic tutor parent update example/);
  assert.match(pageSource, /When to use a lesson update or a progress report/);
});

test("the copied template contains useful prompts without invented lesson details", () => {
  assert.match(pageSource, /\[topic or skill\]/);
  assert.match(pageSource, /\[specific success\]/);
  assert.match(pageSource, /\[area to improve or next focus\]/);
  assert.match(pageSource, /\[Homework or useful next step/);
  assert.match(pageSource, /check the\s+message before sending/);
});
