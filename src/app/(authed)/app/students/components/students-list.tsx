"use client";

import Link from "next/link";
import { useState } from "react";

type Student = {
  id: string;
  student_name: string;
  parent_name: string | null;
  parent_contact: string | null;
  parent_email: string | null;
  archived_at: string | null;
};

type StudentsListProps = {
  students: Student[];
};

export function StudentsList({ students }: StudentsListProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filteredStudents = normalized
    ? students.filter((student) =>
        student.student_name.toLowerCase().includes(normalized),
      )
    : students;

  return (
    <div>
      <label htmlFor="search" className="block text-sm font-medium text-zinc-700">
        Search by student name
      </label>
      <input
        id="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type a student name"
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      />

      {filteredStudents.length === 0 ? (
        <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          No matching students.
        </p>
      ) : (
        <div className="mt-4 space-y-3 md:hidden">
          {filteredStudents.map((student) => {
            const parentContact = student.parent_contact || student.parent_email;

            return (
              <div key={student.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="min-w-0">
                  <Link
                    href={`/app/students/${student.id}`}
                    className="block text-base font-medium text-zinc-900 underline-offset-4 hover:underline"
                  >
                    {student.student_name}
                  </Link>

                  {student.parent_name || parentContact ? (
                    <div className="mt-2 space-y-1 text-sm text-zinc-600">
                      {student.parent_name ? <p>Parent: {student.parent_name}</p> : null}
                      {parentContact ? <p>Contact: {parentContact}</p> : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <Link
                    href={`/app/students/${student.id}/new-lesson`}
                    className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Log lesson
                  </Link>
                  <Link
                    href={`/app/students/${student.id}/schedule-lesson`}
                    className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Schedule lesson
                  </Link>
                  <Link
                    href={`/app/students/${student.id}`}
                    className="inline-flex min-h-10 items-center justify-center text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredStudents.length > 0 ? (
        <div className="mt-4 hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-4 py-3 font-medium">Student name</th>
                <th className="px-4 py-3 font-medium">Parent name</th>
                <th className="px-4 py-3 font-medium">Parent contact</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-zinc-200 text-zinc-900 hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/students/${student.id}`}
                      className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                    >
                      {student.student_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-900">{student.parent_name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-900">
                    {student.parent_contact || student.parent_email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/app/students/${student.id}/new-lesson`}
                        className="inline-flex rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        Log lesson
                      </Link>
                      <Link
                        href={`/app/students/${student.id}/schedule-lesson`}
                        className="inline-flex rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 underline-offset-4 transition-colors hover:bg-zinc-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        Schedule lesson
                      </Link>
                      <Link
                        href={`/app/students/${student.id}`}
                        className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
