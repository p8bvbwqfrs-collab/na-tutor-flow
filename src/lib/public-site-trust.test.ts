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
const footerSource = readFileSync(
  new URL("../components/site-footer.tsx", import.meta.url),
  "utf8",
);
const privacySource = readFileSync(
  new URL("../app/(public)/privacy/page.tsx", import.meta.url),
  "utf8",
);
const termsSource = readFileSync(
  new URL("../app/(public)/terms/page.tsx", import.meta.url),
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
  assert.match(homepageSource, /do not sell your data/);
  assert.match(
    homepageSource,
    /do not sell your data or use student and lesson content to train AI/,
  );
  assert.match(homepageSource, /free for early adopters/);
  assert.match(homepageSource, /always be a free option/);
  assert.match(homepageSource, /never be charged automatically/);
  assert.doesNotMatch(homepageSource, /thousands of tutors|trusted by|five-star software/i);
});

test("privacy and terms explain data use and sustainable pricing plainly", () => {
  assert.match(privacySource, /sell your data/);
  assert.match(privacySource, /Student and lesson content is not used to train AI models/);
  assert.match(privacySource, /external AI service for generation/);

  assert.match(termsSource, /Free access and future pricing/);
  assert.match(termsSource, /Anyone who creates an account during this/);
  assert.match(termsSource, /period is an early adopter/);
  assert.match(termsSource, /always be a free option/);
  assert.match(termsSource, /optional paid features or plans/);
  assert.match(termsSource, /automatically without your active agreement/);
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

test("maths tutoring is referenced only from the public footer", () => {
  assert.doesNotMatch(homepageSource, /maths.tutor/i);
  assert.doesNotMatch(publicLayoutSource, /maths.tutor/i);
  assert.match(footerSource, /href="\/maths-tutor"/);
  assert.match(footerSource, /Maths tutoring/);
});

test("public navigation exposes the product explanation", () => {
  const howItWorksPosition = publicLayoutSource.indexOf('href="/how-it-works"');

  assert.notEqual(howItWorksPosition, -1);
});

test("the homepage preview reflects the current student workflow without an outdated screenshot", () => {
  const previewSource = readFileSync(
    new URL("../app/(public)/components/student-workflow-preview.tsx", import.meta.url),
    "utf8",
  );

  assert.match(homepageSource, /<StudentWorkflowPreview/);
  assert.doesNotMatch(homepageSource, /tutor-flow-student-preview\.png/);
  assert.match(previewSource, /Current position/);
  assert.match(previewSource, /Product preview/);
  assert.match(previewSource, /Example data/);
  assert.match(previewSource, /select-none/);
  assert.match(previewSource, /cursor-default/);
  assert.match(previewSource, /Latest parent update/);
  assert.match(previewSource, /What we covered/);
  assert.match(previewSource, /Next focus/);
  assert.match(homepageSource, /<h3 className="mt-2 text-sm font-semibold/);
});
