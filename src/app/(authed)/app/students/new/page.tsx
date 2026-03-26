"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NewStudentPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formErrorId = "new-student-form-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedStudentName = studentName.trim();
    const trimmedParentContact = parentContact.trim();

    if (!trimmedStudentName) {
      setError("Student name is required.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError("We couldn’t confirm your session. Please sign in again and try once more.");
      return;
    }

    if (!user) {
      setError("You are not signed in. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from("students").insert({
      student_name: trimmedStudentName,
      parent_name: parentName.trim() || null,
      parent_contact: trimmedParentContact || null,
      notes: notes.trim() || null,
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message || "We couldn’t save this student. Please try again.");
      return;
    }

    router.push("/app/students");
    router.refresh();
  }

  return (
    <section className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-zinc-900">Add student</h1>
        <p className="mt-1 text-sm text-zinc-600">Save student and parent details.</p>
      </div>

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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
          >
            {isSubmitting ? "Saving..." : "Save student"}
          </button>
          <Link
            href="/app/students"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
