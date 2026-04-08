import { formatShortDateLocal, formatTimeLocal } from "@/lib/datetime";

export type ParentUpdateLesson = {
  lessonAt: string;
  topics: string;
  wentWell: string;
  parentNote: string;
  improve: string;
  homework: string;
  effort: number;
  confidence: number;
  nextLessonAt?: string | null;
};

export function splitIntoBulletPoints(input: string) {
  return input
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*;\s*/))
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function formatParentUpdate(studentName: string, lesson: ParentUpdateLesson) {
  const dateText = formatShortDateLocal(lesson.lessonAt);

  const focusPoints = splitIntoBulletPoints(lesson.topics);
  const wentWellPoints = splitIntoBulletPoints(lesson.wentWell);
  const improvePoints = splitIntoBulletPoints(lesson.improve);
  const homeworkPoints = splitIntoBulletPoints(lesson.homework);
  const lines = [`${studentName} – lesson update (${dateText})`];

  if (lesson.parentNote.trim()) {
    lines.push("", lesson.parentNote.trim());
  }

  if (focusPoints.length > 0) {
    lines.push("", "Today we worked on", ...focusPoints.map((point) => `• ${point}`));
  }

  if (wentWellPoints.length > 0) {
    lines.push("", "What went well", ...wentWellPoints.map((point) => `• ${point}`));
  }

  if (improvePoints.length > 0) {
    lines.push("", "Next focus", ...improvePoints.map((point) => `• ${point}`));
  }

  if (homeworkPoints.length > 0) {
    lines.push("", "Homework", ...homeworkPoints.map((point) => `• ${point}`));
  }

  if (lesson.nextLessonAt) {
    lines.push(
      "",
      `Next lesson scheduled: ${formatShortDateLocal(lesson.nextLessonAt)} at ${formatTimeLocal(lesson.nextLessonAt)}`,
    );
  }

  lines.push("", `Effort: ${lesson.effort}/5`, `Confidence: ${lesson.confidence}/5`);

  return lines.join("\n");
}
