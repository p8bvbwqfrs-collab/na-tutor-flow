import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import {
  formatTimeLocal,
  getDateKeyLocal,
  getLondonDateTimeInputValues,
} from "./datetime";
import {
  getSubmittedLessonAtIso,
  getSubmittedLessonAtIsoFromForm,
} from "./lesson-scheduling";

function submittedValues(date: string, time: string) {
  const values = new Map<string, string>([
    ["lesson_date", date],
    ["lesson_time", time],
  ]);

  return {
    get(name: string) {
      return values.get(name) ?? null;
    },
  };
}

test("creation persists the submitted UK summer time rather than an initial value", () => {
  const lessonAt = getSubmittedLessonAtIso(submittedValues("2026-07-15", "18:00"));

  assert.equal(lessonAt, "2026-07-15T17:00:00.000Z");
});

test("editing persists the submitted UK winter time rather than an initial value", () => {
  const lessonAt = getSubmittedLessonAtIso(submittedValues("2026-01-15", "18:00"));

  assert.equal(lessonAt, "2026-01-15T18:00:00.000Z");
});

test("scheduled lessons use the tutor time zone rather than the device time zone", () => {
  const lessonAt = getSubmittedLessonAtIso(
    submittedValues("2026-07-15", "18:00"),
    "America/New_York",
  );

  assert.equal(lessonAt, "2026-07-15T22:00:00.000Z");
});

test("page reload restores the saved London date and time", () => {
  assert.deepEqual(getLondonDateTimeInputValues("2026-07-15T17:00:00.000Z"), {
    date: "2026-07-15",
    time: "18:00",
  });
  assert.deepEqual(getLondonDateTimeInputValues("2026-01-15T18:00:00.000Z"), {
    date: "2026-01-15",
    time: "18:00",
  });
});

test("calendar display keeps the submitted London time in summer and winter", () => {
  const summerLessonAt = getSubmittedLessonAtIso(submittedValues("2026-07-15", "18:00"));
  const winterLessonAt = getSubmittedLessonAtIso(submittedValues("2026-01-15", "18:00"));

  assert.equal(getDateKeyLocal(summerLessonAt), "2026-07-15");
  assert.equal(formatTimeLocal(summerLessonAt), "18:00");
  assert.equal(getDateKeyLocal(winterLessonAt), "2026-01-15");
  assert.equal(formatTimeLocal(winterLessonAt), "18:00");
});

function withRealLessonForm(
  submit: (elements: {
    dom: JSDOM;
    form: HTMLFormElement;
    dateInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
  }) => void,
) {
  const dom = new JSDOM(`
    <form>
      <input name="lesson_date" value="2026-07-15">
      <input name="lesson_time" value="18:00">
      <button type="submit">Schedule lesson</button>
    </form>
  `);
  const originalFormData = globalThis.FormData;
  const originalHtmlFormElement = globalThis.HTMLFormElement;

  Object.assign(globalThis, {
    FormData: dom.window.FormData,
    HTMLFormElement: dom.window.HTMLFormElement,
  });

  try {
    const form = dom.window.document.querySelector("form");
    const dateInput = dom.window.document.querySelector<HTMLInputElement>("[name=lesson_date]");
    const submitButton = dom.window.document.querySelector("button");

    assert.ok(form);
    assert.ok(dateInput);
    assert.ok(submitButton);

    submit({
      dom,
      form,
      dateInput,
      submitButton,
    });
  } finally {
    Object.assign(globalThis, {
      FormData: originalFormData,
      HTMLFormElement: originalHtmlFormElement,
    });
    dom.window.close();
  }
}

test("submit-button activation constructs FormData from the real form element", () => {
  withRealLessonForm(({ form, submitButton }) => {
    let lessonAt: string | null = null;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      lessonAt = getSubmittedLessonAtIsoFromForm(event.currentTarget as HTMLFormElement);
    });

    submitButton.click();

    assert.equal(lessonAt, "2026-07-15T17:00:00.000Z");
    assert.throws(
      () => getSubmittedLessonAtIsoFromForm(submitButton as unknown as HTMLFormElement),
      /requires an HTML form element/,
    );
  });
});

test("Enter from a form control follows the same real form submission path", () => {
  withRealLessonForm(({ dom, form, dateInput }) => {
    let lessonAt: string | null = null;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      lessonAt = getSubmittedLessonAtIsoFromForm(event.currentTarget as HTMLFormElement);
    });
    dateInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.defaultPrevented) {
        form.requestSubmit();
      }
    });

    dateInput.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );

    assert.equal(lessonAt, "2026-07-15T17:00:00.000Z");
  });
});
