import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(
  new URL("../app/(public)/maths-tutor/page.tsx", import.meta.url),
  "utf8",
);
const enquirySource = readFileSync(
  new URL("../app/(public)/maths-tutor/maths-tuition-enquiry-link.tsx", import.meta.url),
  "utf8",
);

test("the maths tutoring page gives families a clear mobile-first decision path", () => {
  assert.match(pageSource, /Calm, expert maths tuition that builds confidence/);
  assert.match(pageSource, /Support matched to the course/);
  assert.match(pageSource, /How lessons work/);
  assert.match(pageSource, /Common questions/);
  assert.doesNotMatch(pageSource, /Limited availability for September/);
});

test("verified credentials and all nine reviews remain present", () => {
  assert.match(pageSource, /More than 10 years/);
  assert.match(pageSource, /University of Warwick/);
  assert.match(pageSource, /Nine verified 5-star reviews/);
  assert.match(pageSource, /Read all nine parent reviews/);
  assert.equal((pageSource.match(/\n    quote:/g) ?? []).length, 9);
});

test("enquiries are measurable using fixed, privacy-safe placements", () => {
  assert.match(enquirySource, /track\("maths_tuition_enquiry", \{ placement \}\)/);
  assert.match(enquirySource, /placement: "hero" \| "footer"/);
  assert.match(enquirySource, /Analytics must never prevent/);
  assert.equal((enquirySource.match(/track\(/g) ?? []).length, 1);
});

test("search engines receive matching service and FAQ information", () => {
  assert.match(pageSource, /"@type": "Service"/);
  assert.match(pageSource, /"@type": "FAQPage"/);
  assert.match(pageSource, /priceCurrency: "GBP"/);
  assert.match(pageSource, /faqs\.map/);
});
