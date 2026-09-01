import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();
const pageSource = readFileSync(
  path.join(repositoryRoot, "src/app/(public)/tutor-payment-tracker/page.tsx"),
  "utf8",
);
const csvTemplate = readFileSync(
  path.join(repositoryRoot, "public/templates/tutor-payment-tracker-template.csv"),
  "utf8",
);

test("the payment resource provides a useful tutor workflow rather than thin SEO copy", () => {
  assert.match(pageSource, /title: "Free Tutor Payment Tracker Template"/);
  assert.match(pageSource, /Free tutor payment tracker template/);
  assert.match(pageSource, /Use the template in Excel or Google Sheets/);
  assert.match(pageSource, /does not require an email address or Tutor Flow account/);
  assert.match(pageSource, /outstanding balance is made up of lesson fees not yet/);
  assert.match(pageSource, /A simple weekly payment workflow/);
  assert.match(pageSource, /How to handle advance payments/);
  assert.match(pageSource, /Paid, outstanding, or covered by credit/);
  assert.match(pageSource, /\/templates\/tutor-payment-tracker-template\.csv/);
});

test("the downloadable tracker covers lessons, payments, balances and examples", () => {
  const [headers, ...rows] = csvTemplate.trim().split("\n");

  assert.equal(
    headers,
    "Student name,Lesson date,Lesson fee,Payment date,Amount received,Status,Payment reference or notes",
  );
  assert.equal(rows.length, 3);
  assert.ok(rows.every((row) => row.startsWith("Example - ")));
  assert.match(csvTemplate, /Outstanding/);
  assert.match(csvTemplate, /Covered by credit/);
});
