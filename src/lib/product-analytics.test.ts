import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const analyticsSource = readFileSync("src/lib/product-analytics.ts", "utf8");

test("activation analytics uses fixed privacy-safe workflow labels only", () => {
  assert.match(analyticsSource, /track\("activation_step", \{ step \}\)/);
  assert.match(analyticsSource, /Product actions must continue normally/);
  assert.equal((analyticsSource.match(/track\(/g) ?? []).length, 1);
});

test("successful activation actions emit the shared milestone event", () => {
  const sources = [
    "src/app/(public)/login/login-client.tsx",
    "src/app/(authed)/app/students/new/page.tsx",
    "src/app/(authed)/app/students/[id]/new-lesson/new-lesson-form.tsx",
    "src/components/lesson-update-actions.tsx",
    "src/app/(authed)/app/students/[id]/components/record-payment-form.tsx",
  ].map((path) => readFileSync(path, "utf8"));

  for (const source of sources) {
    assert.match(source, /trackActivationStep/);
  }

  assert.match(sources[0], /trackActivationStep\("signup_submitted"\)/);
  assert.match(sources[1], /trackActivationStep\("student_added"\)/);
  assert.match(sources[2], /trackActivationStep\("lesson_logged"\)/);
  assert.match(sources[3], /trackActivationStep\("parent_update_shared"\)/);
  assert.match(sources[4], /trackActivationStep\("payment_recorded"\)/);
});
