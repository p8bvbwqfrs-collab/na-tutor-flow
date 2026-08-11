"use client";

import { useState } from "react";
import { getMonthKeyLocal } from "@/lib/datetime";
import type { MonthlyParentUpdateLesson } from "@/lib/monthly-parent-update";
import type { AllocationLike } from "@/lib/payments";
import { MonthControls } from "./month-controls";
import { MonthlySummaryGenerator } from "./monthly-summary-generator";
import { PastLessonsMonthlySection } from "./past-lessons-monthly-section";

type StudentHistoryLesson = MonthlyParentUpdateLesson & {
  id: string;
  fee_pence: number;
};

type StudentLessonHistoryProps = {
  studentId: string;
  studentName: string;
  lessons: StudentHistoryLesson[];
  allocations: AllocationLike[];
  initialMonthKey: string;
  timeZone: string;
  hasLessonsError: boolean;
  nextLessonAt?: string | null;
};

export function StudentLessonHistory({
  studentId,
  studentName,
  lessons,
  allocations,
  initialMonthKey,
  timeZone,
  hasLessonsError,
  nextLessonAt,
}: StudentLessonHistoryProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
  const lessonsForMonth = lessons.filter(
    (lesson) => getMonthKeyLocal(lesson.lesson_at, timeZone) === selectedMonthKey,
  );

  return (
    <section aria-labelledby="lesson-history-heading">
      <h3 id="lesson-history-heading" className="text-base font-medium text-zinc-900">
        Lesson history
      </h3>

      <div className="mt-3">
        <MonthControls
          monthKey={selectedMonthKey}
          onChange={setSelectedMonthKey}
          label={`${lessonsForMonth.length} ${lessonsForMonth.length === 1 ? "lesson" : "lessons"}`}
          timeZone={timeZone}
        />
      </div>

      <div className="mt-3">
        <MonthlySummaryGenerator
          key={selectedMonthKey}
          studentName={studentName}
          lessons={lessons}
          selectedMonthKey={selectedMonthKey}
          timeZone={timeZone}
          nextLessonAt={nextLessonAt}
        />
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-5">
        <h3 className="text-base font-medium text-zinc-900">Previous lessons</h3>
        <div className="mt-3">
          <PastLessonsMonthlySection
            studentId={studentId}
            lessons={lessons}
            allocations={allocations}
            selectedMonthKey={selectedMonthKey}
            timeZone={timeZone}
            hasLessonsError={hasLessonsError}
          />
        </div>
      </div>
    </section>
  );
}
