"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type EditStudentFormProps = {
  studentId: string;
  initialStudentName: string;
  initialParentName: string;
  initialParentContact: string;
  initialNotes: string;
};

export function EditStudentForm({
  studentId,
  initialStudentName,
  initialParentName,
  initialParentContact,
  initialNotes,
}: EditStudentFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [studentName, setStudentName] = useState(initialStudentName);
  const [parentName, setParentName] = useState(initialParentName);
  const [parentContact, setParentContact] = useState(initialParentContact);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formErrorId = "edit-student-form-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedStudentName = studentName.trim();
    const trimmedParentContact = parentContact.trim();

    if (!trimmedStudentName) {
      setError("Student name is required.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase
      .from("students")
      .update({
        student_name: trimmedStudentName,
        parent_name: parentName.trim() || null,
        parent_contact: trimmedParentContact || null,
        notes: notes.trim() || null,
      })
      .eq("id", studentId);

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/app/students/${studentId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <div>
        <label htmlFor="student_name" className="block text-sm font-medium text-zinc-700">
          Student name
        </label>
        <input
          id="student_name"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={studentName}
          onChange={(event) => setStudentName(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="parent_name" className="block text-sm font-medium text-zinc-700">
          Parent name
        </label>
        <input
          id="parent_name"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={parentName}
          onChange={(event) => setParentName(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="parent_contact" className="block text-sm font-medium text-zinc-700">
          Parent contact (email or mobile)
        </label>
        <input
          id="parent_contact"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={parentContact}
          onChange={(event) => setParentContact(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      {error ? (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
