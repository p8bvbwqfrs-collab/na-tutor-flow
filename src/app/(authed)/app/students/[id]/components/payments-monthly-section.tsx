"use client";

import { useState } from "react";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateLocal, formatMonthLocal, getMonthKeyLocal } from "@/lib/datetime";
import type { PaymentLike } from "@/lib/payments";
import { MonthControls, getMonthStartFromKey } from "./month-controls";
import { PaymentRecordActions, RecordPaymentForm } from "./record-payment-form";

type Payment = PaymentLike & {
  payment_date: string | null;
  note: string | null;
  created_at: string;
};

type PaymentsMonthlySectionProps = {
  studentId: string;
  payments: Payment[];
  outstandingAmountPence: number;
  studentCreditPence: number;
  currencyCode: SupportedCurrencyCode;
  initialMonthKey: string;
  readOnly?: boolean;
};

function getPaymentDateValue(payment: Pick<Payment, "payment_date" | "created_at">) {
  return payment.payment_date ?? payment.created_at;
}

function getPaymentDetail(payment: Pick<Payment, "note" | "source">) {
  if (payment.note) {
    return payment.note;
  }

  if (payment.source === "lesson_paid_now") {
    return "Recorded for lesson";
  }

  if (payment.source === "imported") {
    return "Imported";
  }

  return "Recorded payment";
}

export function PaymentsMonthlySection({
  studentId,
  payments,
  outstandingAmountPence,
  studentCreditPence,
  currencyCode,
  initialMonthKey,
  readOnly = false,
}: PaymentsMonthlySectionProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
  const selectedMonthStart = getMonthStartFromKey(selectedMonthKey);
  const paymentsForSelectedMonth = payments.filter(
    (payment) => getMonthKeyLocal(getPaymentDateValue(payment)) === selectedMonthKey,
  );
  const paymentsForSelectedMonthPence = paymentsForSelectedMonth.reduce(
    (sum, payment) => sum + payment.amount_pence,
    0,
  );

  return (
    <section>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-zinc-900">Payments</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Mark individual lessons as paid from their lesson record. Use an upfront payment when
              a student pays for several lessons at once.
            </p>
          </div>
          {!readOnly ? <RecordPaymentForm studentId={studentId} currencyCode={currencyCode} /> : null}
        </div>
        <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${studentCreditPence > 0 ? "lg:grid-cols-3" : ""}`}>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Outstanding</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">
              {formatCurrencyFromMinorUnits(outstandingAmountPence, currencyCode)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Still due for completed lessons.</p>
          </div>
          {studentCreditPence > 0 ? (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Credit available</p>
              <p className="mt-1 text-sm font-semibold text-blue-900">
                {formatCurrencyFromMinorUnits(studentCreditPence, currencyCode)}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Already received and ready for the next outstanding lesson.
              </p>
            </div>
          ) : null}
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Received</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">
              {formatCurrencyFromMinorUnits(paymentsForSelectedMonthPence, currencyCode)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">{formatMonthLocal(selectedMonthStart)}</p>
          </div>
        </div>

        <div className="mt-4">
          <MonthControls
            monthKey={selectedMonthKey}
            onChange={setSelectedMonthKey}
            label={`${paymentsForSelectedMonth.length} ${
              paymentsForSelectedMonth.length === 1 ? "payment" : "payments"
            }`}
          />
        </div>

        <div className="mt-4">
          {paymentsForSelectedMonth.length > 0 ? (
            <div className="space-y-2">
              {paymentsForSelectedMonth.map((payment) => (
                <div key={payment.id} className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {formatCurrencyFromMinorUnits(payment.amount_pence, currencyCode)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {formatDateLocal(getPaymentDateValue(payment))} · {getPaymentDetail(payment)}
                      </p>
                    </div>
                    {!readOnly && payment.source === "recorded_payment" ? (
                      <PaymentRecordActions studentId={studentId} currencyCode={currencyCode} payment={payment} />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              No payments recorded this month.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
