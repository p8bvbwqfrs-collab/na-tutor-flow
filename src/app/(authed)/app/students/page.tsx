import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileLogLessonFab } from "./components/mobile-log-lesson-fab";
import { StudentsList } from "./components/students-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Student = {
  id: string;
  student_name: string;
  parent_name: string | null;
  parent_contact: string | null;
  parent_email: string | null;
  archived_at: string | null;
};

type StudentsPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  noStore();

  const { view } = await searchParams;
  const showArchived = view === "archived";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("students")
    .select("id, student_name, parent_name, parent_contact, parent_email, archived_at")
    .order("created_at", { ascending: false });

  query = showArchived
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);

  const { data, error } = await query;

  if (error) {
    return (
      <section>
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load students. Please refresh and try again.
        </div>
      </section>
    );
  }

  const students: Student[] = data ?? [];

  return (
    <>
      <section>
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Students</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage your student list and parent details.</p>

            <div className="mt-3 inline-flex rounded-md border border-zinc-200 bg-white p-1">
              <Link
                href="/app/students"
                className={`rounded px-3 py-1.5 text-sm ${
                  !showArchived
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-900 hover:underline"
                }`}
              >
                Active
              </Link>
              <Link
                href="/app/students?view=archived"
                className={`rounded px-3 py-1.5 text-sm ${
                  showArchived
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-900 hover:underline"
                }`}
              >
                Archived
              </Link>
            </div>

            {showArchived ? (
              <p className="mt-2 text-xs text-zinc-600">
                Archived students are hidden from your active list but keep their history.
              </p>
            ) : null}
          </div>

          <Link
            href="/app/students/new"
            className="inline-flex w-fit rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Add student
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center">
            {showArchived ? (
              <p className="text-sm text-zinc-600">No archived students.</p>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-900">No students yet.</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Add your first student to start logging lessons and tracking progress.
                </p>
              </>
            )}
            {!showArchived ? (
              <Link
                href="/app/students/new"
                className="mt-4 inline-flex rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Add student
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-6">
            <StudentsList students={students} />
          </div>
        )}
      </section>

      {!showArchived ? <MobileLogLessonFab students={students} /> : null}
    </>
  );
}
