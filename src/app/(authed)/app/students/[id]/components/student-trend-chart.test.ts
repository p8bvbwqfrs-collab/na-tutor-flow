import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentTrendChart } from "./student-trend-chart";

test("combines confidence and effort in one accessible learning trend", () => {
  const markup = renderToStaticMarkup(
    createElement(StudentTrendChart, {
      points: [
        { label: "01 Jul", confidence: 3, effort: 4 },
        { label: "08 Jul", confidence: 4, effort: 5 },
      ],
    }),
  );

  assert.match(markup, /Confidence/);
  assert.match(markup, /Effort/);
  assert.match(markup, /Latest: confidence 4\/5 · effort 5\/5/);
  assert.match(markup, /aria-label="Recent learning trend\. 01 Jul: confidence 3 out of 5, effort 4 out of 5/);
  assert.equal((markup.match(/<polyline/g) ?? []).length, 2);
});

test("explains when there is no learning trend data", () => {
  const markup = renderToStaticMarkup(createElement(StudentTrendChart, { points: [] }));

  assert.match(markup, /No learning trend yet/);
  assert.match(markup, /after the first completed lesson/);
  assert.doesNotMatch(markup, /<svg/);
});
