import { NextRequest, NextResponse } from "next/server";
import {
  addDefaultDuration,
  buildCalendarFeed,
  isCalendarFeedTokenCurrent,
  normalizeCalendarFeedVersion,
  verifyCalendarFeedToken,
} from "@/lib/calendar-feed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FeedLessonRow = {
  id: string;
  lesson_at: string;
  topics: string;
  improve: string | null;
  homework: string | null;
  effort: number;
  confidence: number;
  status: "planned" | "completed" | "cancelled" | null;
  student: { student_name: string } | { student_name: string }[] | null;
};

function getStudentName(
  student: { student_name: string } | { student_name: string }[] | null | undefined,
) {
  if (!student) {
    return "Student";
  }

  if (Array.isArray(student)) {
    return student[0]?.student_name ?? "Student";
  }

  return student.student_name ?? "Student";
}

function buildLessonDescription(lesson: FeedLessonRow) {
  if (lesson.status === "planned") {
    if (!lesson.topics || lesson.topics === "Planned lesson") {
      return "Planned lesson";
    }

    return lesson.topics;
  }

  const parts = [
    lesson.topics ? `What was covered: ${lesson.topics}` : null,
    `Student effort: ${lesson.effort}/5`,
    `Confidence: ${lesson.confidence}/5`,
    lesson.improve ? `Area to improve: ${lesson.improve}` : null,
    lesson.homework ? `Homework / follow-up: ${lesson.homework}` : null,
  ].filter(Boolean);

  return parts.join("\n");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 401 });
  }

  const tokenPayload = verifyCalendarFeedToken(token, "tutoring");

  if (!tokenPayload) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("calendar_feed_version")
      .eq("user_id", tokenPayload.userId)
      .maybeSingle();

    if (settingsError) {
      return NextResponse.json({ error: "Could not verify calendar feed." }, { status: 500 });
    }

    const currentTokenVersion = normalizeCalendarFeedVersion(
      settings?.calendar_feed_version,
    );

    if (!isCalendarFeedTokenCurrent(tokenPayload, currentTokenVersion)) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("lessons")
      .select(
        "id, lesson_at, topics, improve, homework, effort, confidence, status, student:students!lessons_student_id_fkey(student_name)",
      )
      .eq("user_id", tokenPayload.userId)
      .neq("status", "cancelled")
      .order("lesson_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Could not load calendar feed." }, { status: 500 });
    }

    const lessons = (data ?? []) as FeedLessonRow[];
    const calendar = buildCalendarFeed(
      "Tutoring calendar",
      lessons.map((lesson) => ({
        id: lesson.id,
        title: `Tutoring – ${getStudentName(lesson.student)}`,
        startsAt: lesson.lesson_at,
        endsAt: addDefaultDuration(lesson.lesson_at),
        description: buildLessonDescription(lesson),
      })),
    );

    return new NextResponse(calendar, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Calendar feeds are not configured yet." },
      { status: 503 },
    );
  }
}
