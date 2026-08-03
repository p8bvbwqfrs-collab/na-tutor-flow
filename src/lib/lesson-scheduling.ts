import { DEFAULT_TIME_ZONE, zonedDateTimeToIso } from "@/lib/datetime";

type FormValues = Pick<FormData, "get">;

export function getSubmittedLessonAtIso(formData: FormValues, timeZone = DEFAULT_TIME_ZONE) {
  const lessonDate = formData.get("lesson_date");
  const lessonTime = formData.get("lesson_time");

  if (typeof lessonDate !== "string" || typeof lessonTime !== "string") {
    throw new Error("Lesson date and time is required.");
  }

  return zonedDateTimeToIso(lessonDate, lessonTime, timeZone);
}

export function getSubmittedLessonAtIsoFromForm(
  form: HTMLFormElement,
  timeZone = DEFAULT_TIME_ZONE,
) {
  if (!(form instanceof HTMLFormElement)) {
    throw new TypeError("Scheduled lesson submission requires an HTML form element.");
  }

  return getSubmittedLessonAtIso(new FormData(form), timeZone);
}
