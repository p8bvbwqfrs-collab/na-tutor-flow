import { londonDateTimeToIso } from "@/lib/datetime";

type FormValues = Pick<FormData, "get">;

export function getSubmittedLessonAtIso(formData: FormValues) {
  const lessonDate = formData.get("lesson_date");
  const lessonTime = formData.get("lesson_time");

  if (typeof lessonDate !== "string" || typeof lessonTime !== "string") {
    throw new Error("Lesson date and time is required.");
  }

  return londonDateTimeToIso(lessonDate, lessonTime);
}
