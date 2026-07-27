import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { deleteArchivedStudent, type StudentDeletionDependencies } from "./student-data-controls";

const ownedArchivedStudent = {
  id: "student-1",
  user_id: "user-1",
  student_name: "Alex Smith",
  archived_at: "2026-07-01T12:00:00.000Z",
};

function dependencies(
  overrides: Partial<StudentDeletionDependencies> = {},
): StudentDeletionDependencies {
  return {
    getAuthenticatedUserId: async () => "user-1",
    findOwnedStudent: async () => ownedArchivedStudent,
    deleteOwnedArchivedStudent: async () => ({ deletedId: "student-1", error: null }),
    ...overrides,
  };
}

test("active-student deletion is rejected without issuing a delete", async () => {
  let deleteCalled = false;
  const result = await deleteArchivedStudent(
    dependencies({
      findOwnedStudent: async () => ({ ...ownedArchivedStudent, archived_at: null }),
      deleteOwnedArchivedStudent: async () => {
        deleteCalled = true;
        return { deletedId: "student-1", error: null };
      },
    }),
    { studentId: "student-1", confirmationName: "Alex Smith" },
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /archive/i);
  assert.equal(deleteCalled, false);
});

test("incorrect confirmation text is rejected", async () => {
  const result = await deleteArchivedStudent(dependencies(), {
    studentId: "student-1",
    confirmationName: "alex smith",
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /exactly/i);
});

test("unauthorized deletion is rejected", async () => {
  const result = await deleteArchivedStudent(
    dependencies({ findOwnedStudent: async () => null }),
    { studentId: "student-1", confirmationName: "Alex Smith" },
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /could not be found/i);
});

test("an owned archived student is deleted once", async () => {
  const calls: Array<{ studentId: string; userId: string }> = [];
  const result = await deleteArchivedStudent(
    dependencies({
      deleteOwnedArchivedStudent: async (studentId, userId) => {
        calls.push({ studentId, userId });
        return { deletedId: studentId, error: null };
      },
    }),
    { studentId: "student-1", confirmationName: "Alex Smith" },
  );

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls, [{ studentId: "student-1", userId: "user-1" }]);
});

test("a failed deletion query never reports success", async () => {
  const result = await deleteArchivedStudent(
    dependencies({
      deleteOwnedArchivedStudent: async () => ({
        deletedId: null,
        error: "database unavailable",
      }),
    }),
    { studentId: "student-1", confirmationName: "Alex Smith" },
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /could not be deleted/i);
});

test("schema constraints cascade all associated student financial and lesson data", () => {
  const schema = readFileSync("supabase/schema.sql", "utf8");

  assert.match(
    schema,
    /student_id uuid not null references public\.students\(id\) on delete cascade/g,
  );
  assert.match(
    schema,
    /payment_id uuid not null references public\.payments\(id\) on delete cascade/,
  );
  assert.match(
    schema,
    /lesson_id uuid not null references public\.lessons\(id\) on delete cascade/,
  );
});

test("RLS migration restricts deletion to archived students and related writes to active students", () => {
  const migration = readFileSync(
    "supabase/migrations/20260727_guard_archived_student_writes.sql",
    "utf8",
  );

  assert.match(migration, /user_id = auth\.uid\(\) and archived_at is not null/);
  assert.match(migration, /students\.archived_at is null/);
  assert.match(migration, /lessons_insert_own/);
  assert.match(migration, /payments_insert_own/);
  assert.match(migration, /payment_allocations_insert_own/);
});

test("archived list and detail source omit mutating actions and expose restore/delete controls", () => {
  const list = readFileSync(
    "src/app/(authed)/app/students/components/students-list.tsx",
    "utf8",
  );
  const detail = readFileSync("src/app/(authed)/app/students/[id]/page.tsx", "utf8");
  const archiveToggle = readFileSync(
    "src/app/(authed)/app/students/[id]/components/student-archive-toggle.tsx",
    "utf8",
  );

  assert.match(list, /isArchived/);
  assert.match(list, /View/);
  assert.match(archiveToggle, /Restore student/);
  assert.match(detail, /Archived student/);
  assert.match(detail, /PermanentStudentDeletion/);
  assert.match(detail, /isArchived \? null/);
});

test("archived write routes check archived_at before rendering mutation forms", () => {
  for (const path of [
    "src/app/(authed)/app/students/[id]/edit/page.tsx",
    "src/app/(authed)/app/students/[id]/new-lesson/page.tsx",
    "src/app/(authed)/app/students/[id]/schedule-lesson/page.tsx",
    "src/app/(authed)/app/students/[id]/lessons/[lessonId]/page.tsx",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /archived_at/);
    assert.match(source, /archived=1/);
  }
});

test("permanent deletion dialog supports focus, escape, tab trapping and mobile width", () => {
  const source = readFileSync(
    "src/app/(authed)/app/students/[id]/components/permanent-student-deletion.tsx",
    "utf8",
  );

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key === "Tab"/);
  assert.match(source, /confirmationInputRef\.current\?\.focus/);
  assert.match(source, /openButtonRef\.current\?\.focus/);
  assert.match(source, /w-full max-w-lg/);
});
