export type DashboardStudent = {
  id: string;
  studentName: string;
  archivedAt: string | null;
};

export type DashboardExperienceState =
  | "no_active_students"
  | "student_ready"
  | "lessons_started";

export function deriveDashboardExperience(students: DashboardStudent[], hasLessons: boolean) {
  const activeStudents = students.filter((student) => !student.archivedAt);
  const state: DashboardExperienceState =
    activeStudents.length === 0
      ? "no_active_students"
      : hasLessons
        ? "lessons_started"
        : "student_ready";

  return { state, activeStudents };
}

export function getLessonWorkflowHref(
  action: "log" | "schedule",
  activeStudents: DashboardStudent[],
) {
  if (activeStudents.length === 1) {
    const studentId = activeStudents[0].id;
    return action === "log"
      ? `/app/students/${studentId}/new-lesson`
      : `/app/students/${studentId}/schedule-lesson`;
  }

  return `/app/students?lessonAction=${action}`;
}

export function getDashboardActions(
  state: DashboardExperienceState,
  activeStudents: DashboardStudent[],
) {
  if (state === "no_active_students") {
    return [{ label: "Add your first student", href: "/app/students/new" }];
  }

  const lessonActions = [
    { label: state === "student_ready" ? "Log a lesson" : "Log lesson", href: getLessonWorkflowHref("log", activeStudents) },
    {
      label: state === "student_ready" ? "Schedule a lesson" : "Schedule lesson",
      href: getLessonWorkflowHref("schedule", activeStudents),
    },
  ];

  return state === "lessons_started"
    ? [{ label: "Add student", href: "/app/students/new" }, ...lessonActions]
    : lessonActions;
}
