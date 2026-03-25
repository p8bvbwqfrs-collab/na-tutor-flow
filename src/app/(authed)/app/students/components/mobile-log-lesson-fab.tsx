"use client";

import Link from "next/link";
import { useState } from "react";

type StudentOption = {
  id: string;
  student_name: string;
};

type MobileLogLessonFabProps = {
  students: StudentOption[];
};

export function MobileLogLessonFab({ students }: MobileLogLessonFabProps) {
  const [open, setOpen] = useState(false);

  if (students.length === 0) {
    return null;
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close quick lesson menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
        />
      ) : null}

      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        {open ? (
          <div className="mb-3 w-72 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Log lesson for
            </p>
            <div className="max-h-56 overflow-y-auto">
              {students.map((student) => (
                <Link
                  key={student.id}
                  href={`/app/students/${student.id}/new-lesson`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  {student.student_name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-zinc-700"
        >
          + Lesson
        </button>
      </div>
    </>
  );
}
