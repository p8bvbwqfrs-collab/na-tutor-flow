import { NextRequest, NextResponse } from "next/server";
import { buildCalendarFeed, addDefaultDuration, verifyCalendarFeedToken, type CalendarFeedType } from "@/lib/calendar-feed";
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

function isFeedType(value: string): value is CalendarFeedType {
  return value === "upcoming" || value === "completed";
}

function buildCompletedDescription(lesson: FeedLessonRow) {
  const parts = [
    lesson.topics ? `What was covered: ${lesson.topics}` : null,
    `Student effort: ${lesson.effort}/5`,
    `Confidence: ${lesson.confidence}/5`,
    lesson.improve ? `Area to improve: ${lesson.improve}` : null,
    lesson.homework ? `Homework / follow-up: ${lesson.homework}` : null,
  ].filter(Boolean);

  return parts.join("\n");
}

function buildUpcomingDescription(lesson: FeedLessonRow) {
  if (!lesson.topics || lesson.topics === "Planned lesson") {
    return null;
  }

  return lesson.topics;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ feedType: string }> },
) {
  const { feedType } = await context.params;

  if (!isFeedType(feedType)) {
    return NextResponse.json({ error: "Invalid feed." }, { status: 404 });
  }

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 401 });
  }

  const userId = verifyCalendarFeedToken(token, feedType);

  if (!userId) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const query = supabase
      .from("lessons")
      .select(
        "id, lesson_at, topics, improve, homework, effort, confidence, status, student:students!lessons_student_id_fkey(student_name)",
      )
      .eq("user_id", userId)
      .order("lesson_at", { ascending: feedType === "upcoming" });

    const { data, error } =
      feedType === "upcoming"
        ? await query.eq("status", "planned").gte("lesson_at", nowIso)
        : await query.or("status.eq.completed,status.is.null").lte("lesson_at", nowIso);

    if (error) {
      return NextResponse.json({ error: "Could not load calendar feed." }, { status: 500 });
    }

    const lessons = (data ?? []) as FeedLessonRow[];
    const calendar = buildCalendarFeed(
      feedType === "upcoming" ? "Upcoming tutoring lessons" : "Completed tutoring lessons",
      lessons.map((lesson) => ({
        id: `${feedType}-${lesson.id}`,
        title: `Tutoring – ${getStudentName(lesson.student)}`,
        startsAt: lesson.lesson_at,
        endsAt: addDefaultDuration(lesson.lesson_at),
        description:
          feedType === "upcoming" ? buildUpcomingDescription(lesson) : buildCompletedDescription(lesson),
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
