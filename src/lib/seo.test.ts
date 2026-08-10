import assert from "node:assert/strict";
import test from "node:test";
import { createPublicMetadata } from "./seo";

test("public metadata uses the root title template without repeating the brand", () => {
  const metadata = createPublicMetadata({
    title: "Tutor Lesson Notes Template",
    description: "A practical lesson notes template for tutors.",
    path: "/tutor-lesson-notes-template",
    type: "article",
  });

  assert.equal(metadata.title, "Tutor Lesson Notes Template");
  assert.equal(metadata.alternates?.canonical, "/tutor-lesson-notes-template");
  assert.equal(
    metadata.openGraph && "type" in metadata.openGraph ? metadata.openGraph.type : undefined,
    "article",
  );
});

test("the homepage can set a complete absolute title", () => {
  const metadata = createPublicMetadata({
    title: "Tutor Flow – Simple tutor management software for private tutors",
    description: "A simple tool for private tutors.",
    path: "/",
    absoluteTitle: true,
  });

  assert.deepEqual(metadata.title, {
    absolute: "Tutor Flow – Simple tutor management software for private tutors",
  });
});
