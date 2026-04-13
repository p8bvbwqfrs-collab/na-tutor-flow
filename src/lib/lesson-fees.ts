type SupabaseLike = {
  from: (table: string) => any;
};

export async function getLatestStudentFeeAmount(
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

  return typeof data?.fee_pence === "number" ? (data.fee_pence / 100).toFixed(2) : "0.00";
}
