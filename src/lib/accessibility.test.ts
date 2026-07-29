import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RatingSelector } from "../app/(authed)/app/students/[id]/components/rating-selector";

const rootLayoutSource = readFileSync(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
const publicLayoutSource = readFileSync(
  new URL("../app/(public)/layout.tsx", import.meta.url),
  "utf8",
);
const authedLayoutSource = readFileSync(
  new URL("../app/(authed)/layout.tsx", import.meta.url),
  "utf8",
);
const resetPageSource = readFileSync(
  new URL("../app/auth/reset/page.tsx", import.meta.url),
  "utf8",
);
const lessonFormSource = readFileSync(
  new URL(
    "../app/(authed)/app/students/[id]/new-lesson/new-lesson-form.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("rating selectors expose an identified native radio group", () => {
  const markup = renderToStaticMarkup(
    createElement(RatingSelector, {
      id: "effort",
      label: "Student effort",
      value: "3",
      helperText: "How engaged was the student?",
      onChange: () => {},
    }),
  );

  assert.match(markup, /<fieldset[^>]+aria-describedby="effort-help"/);
  assert.match(markup, /<legend[^>]*>[\s\S]*Student effort[\s\S]*<\/legend>/);
  assert.equal((markup.match(/type="radio"/g) ?? []).length, 5);
  assert.equal((markup.match(/name="effort"/g) ?? []).length, 5);
  assert.match(markup, /id="effort-3"[^>]+checked=""[^>]+value="3"/);
  assert.match(markup, /3 out of 5/);
  assert.doesNotMatch(markup, /aria-pressed/);
});

test("each rendered page has one main landmark owner", () => {
  assert.doesNotMatch(rootLayoutSource, /<main[\s>]/);
  assert.equal((publicLayoutSource.match(/<main[\s>]/g) ?? []).length, 1);
  assert.equal((authedLayoutSource.match(/<main[\s>]/g) ?? []).length, 1);
  assert.equal((resetPageSource.match(/<main[\s>]/g) ?? []).length, 1);
});

test("lesson form errors receive keyboard and screen-reader focus", () => {
  assert.match(lessonFormSource, /const errorRef = useRef<HTMLParagraphElement>\(null\)/);
  assert.match(lessonFormSource, /errorRef\.current\?\.focus\(\)/);
  assert.match(lessonFormSource, /ref=\{errorRef\}/);
  assert.match(lessonFormSource, /role="alert"/);
  assert.match(lessonFormSource, /tabIndex=\{-1\}/);
});
