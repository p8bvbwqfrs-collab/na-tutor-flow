import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync("src/app/(authed)/app/students/page.tsx", "utf8");
const listSource = readFileSync(
  "src/app/(authed)/app/students/components/students-list.tsx",
  "utf8",
);

test("the students page does not duplicate lesson actions in a floating mobile menu", () => {
  assert.doesNotMatch(pageSource, /MobileLogLessonFab/);
  assert.doesNotMatch(pageSource, /fixed bottom-/);
});

test("mobile student cards use explicit links instead of a nested card-sized link", () => {
  assert.doesNotMatch(listSource, /role="link"/);
  assert.doesNotMatch(listSource, /onClick=\{\(\) => openStudent/);
  assert.match(listSource, /View profile/);
  assert.match(listSource, /aria-label=\{`View \$\{student\.student_name\}'s profile`\}/);
  assert.match(listSource, /role="group"/);
  assert.match(listSource, /aria-label=\{`Actions for \$\{student\.student_name\}`\}/);
});

test("a requested lesson workflow gives each student one unambiguous action", () => {
  assert.match(pageSource, /Select a student/);
  assert.match(pageSource, /lessonAction=\{requestedLessonAction\}/);
  assert.match(listSource, /lessonAction \? \(/);
  assert.match(listSource, /for \{student\.student_name\}/);
});
