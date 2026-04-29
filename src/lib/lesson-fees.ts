type SupabaseLike = {
  from: (table: string) => any;
};

export async function getLatestStudentFeeAmount(
  supabase: SupabaseLike,
  studentId: string,
) {
  const [{ data: student }, { data: lesson }] = await Promise.all([
    supabase
      .from("students")
      .select("default_fee_pence")
      .eq("id", studentId)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("fee_pence")
      .eq("student_id", studentId)
      .or("status.neq.cancelled,status.is.null")
      .order("lesson_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const feePence =
    typeof student?.default_fee_pence === "number"
      ? student.default_fee_pence
      : typeof lesson?.fee_pence === "number"
        ? lesson.fee_pence
        : 0;

  return (feePence / 100).toFixed(2);
}

export async function getLatestLessonFeePence(
  supabase: SupabaseLike,
  studentId: string,
) {
  const { data } = await supabase
    .from("lessons")
    .select("fee_pence")
    .eq("student_id", studentId)
    .or("status.neq.cancelled,status.is.null")
    .order("lesson_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return typeof data?.fee_pence === "number" ? data.fee_pence : null;
}
