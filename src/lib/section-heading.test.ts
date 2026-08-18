import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentSource = readFileSync("src/components/section-heading.tsx", "utf8");
const disclosureSource = readFileSync("src/components/info-disclosure.tsx", "utf8");

test("optional section guidance works by touch and keyboard rather than hover alone", () => {
  assert.match(componentSource, /<InfoDisclosure/);
  assert.match(disclosureSource, /<button/);
  assert.match(disclosureSource, /aria-label=\{`About \$\{label\}`\}/);
  assert.match(disclosureSource, /aria-expanded=\{isOpen\}/);
  assert.match(disclosureSource, /aria-controls=\{descriptionId\}/);
  assert.match(disclosureSource, /min-h-10 min-w-10/);
  assert.match(disclosureSource, /onClick=\{\(\) => setIsOpen/);
  assert.doesNotMatch(disclosureSource, /onMouseEnter|onMouseLeave/);
});

test("section headings and control labels share the same information pattern", () => {
  const rangeFilter = readFileSync(
    "src/app/(authed)/app/dashboard/components/chart-range-filter.tsx",
    "utf8",
  );
  const unpaidLessons = readFileSync(
    "src/app/(authed)/app/dashboard/components/unpaid-lessons-section.tsx",
    "utf8",
  );
  const dashboard = readFileSync("src/app/(authed)/app/dashboard/page.tsx", "utf8");

  assert.match(rangeFilter, /<InfoDisclosure/);
  assert.doesNotMatch(rangeFilter, /<p className="mt-1 text-xs leading-5 text-blue-900/);
  assert.match(unpaidLessons, /<SectionHeading/);
  assert.match(dashboard, /title="Income over time"/);
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
