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
  const [action, setAction] = useState<"log" | "schedule" | null>(null);

  if (students.length === 0) {
    return null;
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close quick lesson menu"
          onClick={() => {
            setOpen(false);
            setAction(null);
          }}
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
        />
      ) : null}

      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        {open ? (
          <div className="mb-3 w-72 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
            {action ? (
              <>
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {action === "log" ? "Log lesson for" : "Schedule lesson for"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAction(null)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    Back
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {students.map((student) => (
                    <Link
                      key={student.id}
                      href={
                        action === "log"
                          ? `/app/students/${student.id}/new-lesson`
                          : `/app/students/${student.id}/schedule-lesson`
                      }
                      onClick={() => {
                        setOpen(false);
                        setAction(null);
                      }}
                      className="block rounded-md px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100"
                    >
                      {student.student_name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Choose an action
                </p>
                <button
                  type="button"
                  onClick={() => setAction("log")}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Log lesson
                </button>
                <button
                  type="button"
                  onClick={() => setAction("schedule")}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  Schedule lesson
                </button>
              </div>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() =>
            setOpen((prev) => {
              const next = !prev;
              if (!next) {
                setAction(null);
              }
              return next;
            })
          }
          className="inline-flex items-center rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-zinc-700"
        >
          + Lesson
        </button>
      </div>
    </>
  );
}
