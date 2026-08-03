import { getDateKeyLocal } from "./datetime";

export type PlannedLessonAttention = "overdue" | "today" | "upcoming";

type LessonWithDate = {
  lesson_at: string;
};

export function getPlannedLessonAttention(
  lessonAt: string | Date,
  now: string | Date = new Date(),
): PlannedLessonAttention {
  const lessonDateKey = getDateKeyLocal(lessonAt);
  const todayKey = getDateKeyLocal(now);

  if (lessonDateKey < todayKey) {
    return "overdue";
  }

  if (lessonDateKey === todayKey) {
    return "today";
  }

  return "upcoming";
}

export function getPlannedLessonAttentionLabel(attention: PlannedLessonAttention) {
  if (attention === "overdue") {
    return "Needs completing";
  }

  if (attention === "today") {
    return "Today";
  }

  return "Upcoming";
}

export function partitionPlannedLessons<T extends LessonWithDate>(
  lessons: T[],
  now: string | Date = new Date(),
) {
  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(a.lesson_at).getTime() - new Date(b.lesson_at).getTime(),
  );
  const overdue: T[] = [];
  const today: T[] = [];
  const upcoming: T[] = [];

  sortedLessons.forEach((lesson) => {
    const attention = getPlannedLessonAttention(lesson.lesson_at, now);

    if (attention === "overdue") {
      overdue.push(lesson);
    } else if (attention === "today") {
      today.push(lesson);
    } else {
      upcoming.push(lesson);
    }
  });

  return { overdue, today, upcoming };
}
