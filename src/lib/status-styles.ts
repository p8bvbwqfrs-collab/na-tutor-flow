export type LessonStatus = "planned" | "completed" | "cancelled" | null;

export function getLessonStatusLabel(status: LessonStatus) {
  if (status === "planned") {
    return "Scheduled";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return "Completed";
}

export function getLessonStatusClassName(status: LessonStatus) {
  if (status === "planned") {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  if (status === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}
