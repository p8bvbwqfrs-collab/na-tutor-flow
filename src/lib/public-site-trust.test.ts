import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(
  new URL("../app/(public)/page.tsx", import.meta.url),
  "utf8",
);
const publicLayoutSource = readFileSync(
  new URL("../app/(public)/layout.tsx", import.meta.url),
  "utf8",
);

test("homepage answers core signup trust questions without invented social proof", () => {
  assert.match(homepageSource, /Free to get started/);
  assert.match(homepageSource, /Who is Tutor Flow for\?/);
  assert.match(homepageSource, /How much does it cost\?/);
  assert.match(homepageSource, /What happens to the information I add\?/);
  assert.match(homepageSource, /You retain ownership/);
  assert.match(homepageSource, /download a portable copy/);
  assert.match(homepageSource, /permanently delete your account/);
  assert.doesNotMatch(homepageSource, /thousands of tutors|trusted by|five-star software/i);
});

test("homepage trust copy remains readable at narrow mobile widths", () => {
  const heroLabelPosition = homepageSource.indexOf("Built for independent tutors");
  const heroLabelMarkup = homepageSource.slice(
    homepageSource.lastIndexOf("<p", heroLabelPosition),
    heroLabelPosition,
  );

  assert.doesNotMatch(heroLabelMarkup, /whitespace-nowrap/);
  assert.match(heroLabelMarkup, /text-xs[^"]*sm:text-sm/);
  assert.match(homepageSource, /sm:grid-cols-3/);
});

test("homepage distinguishes the software from the separate tutoring service", () => {
  assert.match(homepageSource, /Is the maths-tutoring service part of the software\?/);
  assert.match(homepageSource, /Tutor Flow is the software product for tutors/);
  assert.match(homepageSource, /separate private tuition service/);
});

test("public navigation exposes product explanation before the separate service", () => {
  const howItWorksPosition = publicLayoutSource.indexOf('href="/how-it-works"');
  const mathsTutorPosition = publicLayoutSource.indexOf('href="/maths-tutor"');

  assert.notEqual(howItWorksPosition, -1);
  assert.notEqual(mathsTutorPosition, -1);
  assert.ok(howItWorksPosition < mathsTutorPosition);
});
