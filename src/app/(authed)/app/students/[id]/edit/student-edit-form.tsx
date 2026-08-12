"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { verifyStudentIsActive } from "../../student-actions";

type EditStudentFormProps = {
  studentId: string;
  initialStudentName: string;
  initialSubject: string;
  initialParentName: string;
  initialParentContact: string;
  initialNotes: string;
  initialDefaultFeeAmount: string;
};

export function EditStudentForm({
  studentId,
  initialStudentName,
  initialSubject,
  initialParentName,
  initialParentContact,
  initialNotes,
  initialDefaultFeeAmount,
}: EditStudentFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [studentName, setStudentName] = useState(initialStudentName);
  const [subject, setSubject] = useState(initialSubject);
  const [parentName, setParentName] = useState(initialParentName);
  const [parentContact, setParentContact] = useState(initialParentContact);
  const [notes, setNotes] = useState(initialNotes);
  const [defaultFee, setDefaultFee] = useState(initialDefaultFeeAmount);
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

    const defaultFeePence = defaultFee.trim() ? Math.round(Number(defaultFee) * 100) : null;

    if (defaultFee.trim() && (!Number.isFinite(Number(defaultFee)) || Number(defaultFee) < 0)) {
      setError("Default lesson fee must be 0 or more.");
      return;
    }

    setIsSubmitting(true);

    const activeStudent = await verifyStudentIsActive(studentId);

    if (!activeStudent.ok) {
      setIsSubmitting(false);
      setError(activeStudent.error);
      return;
    }

    const { error: updateError } = await supabase
      .from("students")
      .update({
        student_name: trimmedStudentName,
        subject: subject.trim() || null,
        parent_name: parentName.trim() || null,
        parent_contact: trimmedParentContact || null,
        notes: notes.trim() || null,
        default_fee_pence: defaultFeePence,
      })
      .eq("id", studentId);

    if (updateError) {
      setIsSubmitting(false);
      setError(updateError.message);
      return;
    }

    window.location.replace(`/app/students/${studentId}`);
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
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-zinc-700">
          Subject
        </label>
        <input
          id="subject"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : "subject-help"}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
        <p id="subject-help" className="mt-1 text-xs text-zinc-500">
          e.g. Maths, French, English, Science
        </p>
      </div>

      <div>
        <label htmlFor="parent_name" className="block text-sm font-medium text-zinc-700">
          Contact name
        </label>
        <input
          id="parent_name"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={parentName}
          onChange={(event) => setParentName(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="parent_contact" className="block text-sm font-medium text-zinc-700">
          Contact details
        </label>
        <input
          id="parent_contact"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={parentContact}
          onChange={(event) => setParentContact(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
      </div>

      <div>
        <label htmlFor="default_fee" className="block text-sm font-medium text-zinc-700">
          Default lesson fee
        </label>
        <input
          id="default_fee"
          type="number"
          min={0}
          step="0.01"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? formErrorId : undefined}
          value={defaultFee}
          onChange={(event) => setDefaultFee(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Used to prefill new lessons. You can still change the fee on each lesson.
        </p>
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
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-zinc-100 disabled:text-zinc-600"
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
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-100"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
