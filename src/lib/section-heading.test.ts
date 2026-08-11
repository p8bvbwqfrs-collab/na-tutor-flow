import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentSource = readFileSync("src/components/section-heading.tsx", "utf8");

test("optional section guidance works by touch and keyboard rather than hover alone", () => {
  assert.match(componentSource, /<button/);
  assert.match(componentSource, /aria-label=\{`About \$\{label\}`\}/);
  assert.match(componentSource, /aria-expanded=\{isOpen\}/);
  assert.match(componentSource, /aria-controls=\{descriptionId\}/);
  assert.match(componentSource, /min-h-10 min-w-10/);
  assert.match(componentSource, /onClick=\{\(\) => setIsOpen/);
  assert.doesNotMatch(componentSource, /onMouseEnter|onMouseLeave/);
});

test("authenticated pages share guidance while redundant page subtitles stay removed", () => {
  const dashboard = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");
  const student = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const calendar = readFileSync("src/app/(authed)/app/calendar/page.tsx", "utf8");
  const settings = readFileSync("src/app/(authed)/app/settings/page.tsx", "utf8");

  for (const source of [dashboard, student, calendar, settings]) {
    assert.match(source, /<SectionHeading/);
  }

  assert.doesNotMatch(dashboard, /See what needs attention/);
  assert.doesNotMatch(student, /Profile, progress, and lesson history/);
  assert.doesNotMatch(calendar, /View your lessons over time/);
  assert.doesNotMatch(settings, /Manage your account, preferences and calendar connection/);
});
