"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrencyLabel, type SupportedCurrencyCode } from "@/lib/currency";
import { autoApplyPaymentToLessons, type AllocationLike, type LessonFeeLike, type PaymentLike } from "@/lib/payments";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { verifyStudentIsActive } from "../../student-actions";

type RecordPaymentFormProps = {
  studentId: string;
  currencyCode: SupportedCurrencyCode;
};

type PaymentRow = PaymentLike & {
  id: string;
  payment_date?: string | null;
  note?: string | null;
};

type AllocationRow = {
  payment_id: string;
  lesson_id: string;
  amount_pence: number;
  payment: PaymentLike | PaymentLike[] | null;
};

function getPayment(payment: PaymentLike | PaymentLike[] | null | undefined) {
  return Array.isArray(payment) ? payment[0] ?? null : payment ?? null;
}

function toAmountValue(amountPence: number) {
  return (amountPence / 100).toFixed(2);
}

async function applyPaymentToStudentLessons(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  studentId: string,
  payment: PaymentRow,
) {
  const lessonIdsResult = await supabase.from("lessons").select("id").eq("student_id", studentId);

  if (lessonIdsResult.error) {
    throw lessonIdsResult.error;
  }

  const lessonIds = ((lessonIdsResult.data ?? []) as Array<{ id: string }>).map((lesson) => lesson.id);
  const lessonsResult = await supabase
    .from("lessons")
    .select("id, lesson_at, fee_pence")
    .eq("student_id", studentId)
    .or("status.neq.cancelled,status.is.null")
    .order("lesson_at", { ascending: true });
  const allocationsResult =
    lessonIds.length > 0
      ? await supabase
          .from("payment_allocations")
          .select("payment_id, lesson_id, amount_pence, payment:payments(id, amount_pence, source, note)")
          .in("lesson_id", lessonIds)
      : { data: [], error: null };

  if (lessonsResult.error || allocationsResult.error) {
    throw lessonsResult.error ?? allocationsResult.error;
  }

  const lessons = (lessonsResult.data ?? []) as LessonFeeLike[];
  const allocations = ((allocationsResult.data ?? []) as AllocationRow[]).map((allocation) => ({
    ...allocation,
    payment: getPayment(allocation.payment),
  })) as AllocationLike[];
  const rows = autoApplyPaymentToLessons(payment, lessons, allocations).map((allocation) => ({
    payment_id: allocation.payment_id,
    lesson_id: allocation.lesson_id,
    amount_pence: allocation.amount_pence,
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("payment_allocations").insert(rows);

  if (error) {
    throw error;
  }
}

export function RecordPaymentForm({ studentId, currencyCode }: RecordPaymentFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    const amountPence = Math.round(amountValue * 100);

    setIsSaving(true);

    const activeStudent = await verifyStudentIsActive(studentId);

    if (!activeStudent.ok) {
      setIsSaving(false);
      setError(activeStudent.error);
      return;
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        student_id: studentId,
        amount_pence: amountPence,
        status: "paid",
        payment_date: paymentDate || null,
        source: "recorded_payment",
        note: note.trim() || null,
      })
      .select("id, amount_pence, source, note")
      .single();

    if (paymentError || !payment) {
      setIsSaving(false);
      setError(paymentError?.message || "Could not record payment.");
      return;
    }

    if (amountPence > 0) {
      try {
        await applyPaymentToStudentLessons(supabase, studentId, payment as PaymentRow);
      } catch {
        setIsSaving(false);
        setError("Payment was recorded, but could not be applied to lessons.");
        router.refresh();
        return;
      }
    }

    setIsSaving(false);
    setAmount("");
    setNote("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setMessage("Payment recorded.");
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-1 sm:items-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          Record upfront payment
        </button>
        {message ? <p role="status" className="text-xs font-medium text-emerald-700">{message}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="payment_amount" className="block text-sm font-medium text-zinc-700">
            Amount ({getCurrencyLabel(currencyCode)})
          </label>
          <input
            id="payment_amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
        <div>
          <label htmlFor="payment_date" className="block text-sm font-medium text-zinc-700">
            Payment date
          </label>
          <input
            id="payment_date"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="payment_note" className="block text-sm font-medium text-zinc-700">
            Note (optional)
          </label>
          <input
            id="payment_note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
      </div>

      <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
        Tutor Flow will pay the oldest outstanding lessons first. Any money left over will remain as
        credit for this student.
      </p>

      {error ? <p role="alert" className="mt-3 text-sm text-rose-800">{error}</p> : null}
      {message ? <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto"
        >
          {isSaving ? "Saving..." : "Save payment"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type PaymentRecordActionsProps = {
  studentId: string;
  currencyCode: SupportedCurrencyCode;
  payment: PaymentRow;
};

export function PaymentRecordActions({ studentId, currencyCode, payment }: PaymentRecordActionsProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(toAmountValue(payment.amount_pence));
  const [paymentDate, setPaymentDate] = useState(payment.payment_date ?? "");
  const [note, setNote] = useState(payment.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    const amountPence = Math.round(amountValue * 100);
    setIsSaving(true);

    const activeStudent = await verifyStudentIsActive(studentId);

    if (!activeStudent.ok) {
      setIsSaving(false);
      setError(activeStudent.error);
      return;
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        amount_pence: amountPence,
        payment_date: paymentDate || null,
        note: note.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      setIsSaving(false);
      setError("Could not update payment.");
      return;
    }

    const { error: allocationDeleteError } = await supabase
      .from("payment_allocations")
      .delete()
      .eq("payment_id", payment.id);

    if (allocationDeleteError) {
      setIsSaving(false);
      setError("Payment was updated, but its lesson coverage could not be refreshed.");
      router.refresh();
      return;
    }

    if (amountPence > 0) {
      try {
        await applyPaymentToStudentLessons(supabase, studentId, {
          ...payment,
          amount_pence: amountPence,
          note: note.trim() || null,
        });
      } catch {
        setIsSaving(false);
        setError("Payment was updated, but could not be applied to lessons.");
        router.refresh();
        return;
      }
    }

    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  async function onDelete() {
    setIsDeleting(true);
    setError(null);

    const activeStudent = await verifyStudentIsActive(studentId);

    if (!activeStudent.ok) {
      setIsDeleting(false);
      setError(activeStudent.error);
      return;
    }

    const { error: deleteError } = await supabase.from("payments").delete().eq("id", payment.id);

    setIsDeleting(false);

    if (deleteError) {
      setError("Could not delete payment.");
      return;
    }

    router.refresh();
  }

  if (isEditing) {
    return (
      <form onSubmit={onSave} className="mt-3 rounded-md border border-zinc-200 bg-white p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`payment_amount_${payment.id}`} className="block text-xs font-medium text-zinc-600">
              Amount ({getCurrencyLabel(currencyCode)})
            </label>
            <input
              id={`payment_amount_${payment.id}`}
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`payment_date_${payment.id}`} className="block text-xs font-medium text-zinc-600">
              Payment date
            </label>
            <input
              id={`payment_date_${payment.id}`}
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`note_${payment.id}`} className="block text-xs font-medium text-zinc-600">
              Note (optional)
            </label>
            <input
              id={`note_${payment.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          Changes will be reapplied to the oldest outstanding lessons automatically.
        </p>
        {error ? <p role="alert" className="mt-2 text-sm text-rose-800">{error}</p> : null}
        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-9 w-full items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white disabled:bg-zinc-400 sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmingDelete(true)}
          disabled={isDeleting}
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:text-rose-300"
        >
          Delete
        </button>
        {error ? <p role="alert" className="basis-full text-xs text-rose-800">{error}</p> : null}
      </div>
      {isConfirmingDelete ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-semibold text-rose-900">Delete payment?</p>
          <p className="mt-1 text-sm text-rose-800">
            This will remove this payment and any lesson coverage linked to it.
          </p>
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:text-rose-300 sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete payment"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
              className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:text-zinc-400 sm:w-auto"
            >
              Keep payment
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
