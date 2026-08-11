import { formatMonthLocal, formatShortDateLocal, formatTimeLocal } from "@/lib/datetime";

export type MonthlyParentUpdateLesson = {
  lesson_at: string;
  topics: string;
  topic_tags: string[] | null;
  effort: number;
  confidence: number;
  went_well: string | null;
  parent_note: string | null;
  improve: string | null;
  homework: string | null;
};

function cleanPhrase(value: string) {
  const cleaned = value
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .trim()
    .replace(/[.;,\s]+$/, "")
    .trim();

  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
}

function splitItems(values: Array<string | null>) {
  return values
    .flatMap((value) => (value ?? "").split(/\n|;/))
    .map(cleanPhrase)
    .filter(Boolean);
}

function normaliseKey(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function normaliseWord(word: string) {
  return word.replace(/[^a-z0-9]/gi, "").replace(/(ing|ed|es|s)$/i, "");
}

function getSignatureTokens(value: string) {
  const ignoredWords = new Set(["and", "for", "that", "the", "this", "with"]);

  return Array.from(
    new Set(
      normaliseKey(value)
        .split(" ")
        .map(normaliseWord)
        .filter((word) => word.length > 2 && !ignoredWords.has(word)),
    ),
  );
}

function areNearDuplicates(left: string, right: string) {
  const leftKey = normaliseKey(left);
  const rightKey = normaliseKey(right);

  if (!leftKey || !rightKey) return false;
  if (leftKey === rightKey || leftKey.includes(rightKey) || rightKey.includes(leftKey)) return true;

  const leftTokens = getSignatureTokens(left);
  const rightTokens = getSignatureTokens(right);
  if (leftTokens.length === 0 || rightTokens.length === 0) return false;

  const overlap = leftTokens.filter((token) => rightTokens.includes(token)).length;
  return overlap >= Math.max(2, Math.min(leftTokens.length, rightTokens.length));
}

function consolidate(values: string[], limit: number) {
  const result: string[] = [];

  values.forEach((value) => {
    const cleaned = cleanPhrase(value);
    if (!cleaned) return;

    const existingIndex = result.findIndex((item) => areNearDuplicates(item, cleaned));
    if (existingIndex >= 0) {
      if (cleaned.length < result[existingIndex].length) result[existingIndex] = cleaned;
      return;
    }

    result.push(cleaned);
  });

  return result.slice(0, limit);
}

function addBulletSection(lines: string[], title: string, items: string[]) {
  if (items.length === 0) return;
  lines.push("", title, ...items.map((item) => `• ${item}`));
}

function formatLearningSnapshot(lessons: MonthlyParentUpdateLesson[]) {
  const averageConfidence =
    lessons.reduce((sum, lesson) => sum + lesson.confidence, 0) / lessons.length;
  const averageEffort = lessons.reduce((sum, lesson) => sum + lesson.effort, 0) / lessons.length;

  if (lessons.length === 1) {
    return `Tutor-recorded confidence was ${lessons[0].confidence}/5 and effort was ${lessons[0].effort}/5 for this lesson.`;
  }

  const firstConfidence = lessons[0].confidence;
  const latestConfidence = lessons[lessons.length - 1].confidence;
  const difference = latestConfidence - firstConfidence;
  const confidenceText =
    difference >= 1
      ? `Tutor-recorded confidence increased from ${firstConfidence}/5 to ${latestConfidence}/5 across the month.`
      : difference <= -1
        ? `Tutor-recorded confidence moved from ${firstConfidence}/5 to ${latestConfidence}/5 across the month, so this may be worth revisiting next month.`
        : `Tutor-recorded confidence was broadly steady, averaging ${averageConfidence.toFixed(1)}/5 across the month.`;

  return `${confidenceText} Average effort was ${averageEffort.toFixed(1)}/5.`;
}

export function buildMonthlyParentUpdate({
  studentName,
  monthKey,
  lessons,
  timeZone,
  nextLessonAt,
}: {
  studentName: string;
  monthKey: string;
  lessons: MonthlyParentUpdateLesson[];
  timeZone: string;
  nextLessonAt?: string | null;
}) {
  if (lessons.length === 0) return "";

  const chronologicalLessons = [...lessons].sort(
    (left, right) => new Date(left.lesson_at).getTime() - new Date(right.lesson_at).getTime(),
  );
  const latestFirstLessons = [...chronologicalLessons].reverse();
  const topicsFromNotes = consolidate(
    splitItems(chronologicalLessons.map((lesson) => lesson.topics)),
    4,
  );
  const topics =
    topicsFromNotes.length > 0
      ? topicsFromNotes
      : consolidate(chronologicalLessons.flatMap((lesson) => lesson.topic_tags ?? []), 4);
  const strengths = consolidate(
    splitItems(
      chronologicalLessons.flatMap((lesson) => [lesson.parent_note, lesson.went_well]),
    ),
    3,
  );
  const nextFocus = consolidate(
    splitItems(latestFirstLessons.map((lesson) => lesson.improve)),
    3,
  );
  const homework = consolidate(
    splitItems(latestFirstLessons.map((lesson) => lesson.homework)),
    3,
  );
  const lessonWord = lessons.length === 1 ? "lesson" : "lessons";
  const lines = [
    `${studentName} – monthly update (${formatMonthLocal(monthKey)})`,
    "",
    `We completed ${lessons.length} ${lessonWord} this month.`,
  ];

  addBulletSection(lines, "What we covered", topics);
  addBulletSection(lines, "Progress and strengths", strengths);
  addBulletSection(lines, "Next focus", nextFocus);
  addBulletSection(lines, "Homework / follow-up", homework);
  lines.push("", "Learning snapshot", formatLearningSnapshot(chronologicalLessons));

  if (nextLessonAt) {
    lines.push(
      "",
      `Next lesson scheduled: ${formatShortDateLocal(nextLessonAt, timeZone)} at ${formatTimeLocal(nextLessonAt, timeZone)}`,
    );
  }

  return lines.join("\n");
}
