"use client";

import { useState } from "react";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateLocal, formatMonthLocal, getMonthKeyLocal } from "@/lib/datetime";
import type { PaymentLike } from "@/lib/payments";
import { MonthControls, getMonthStartFromKey } from "./month-controls";
import { PaymentRecordActions, RecordPaymentForm } from "./record-payment-form";

type Payment = PaymentLike & {
  payment_date: string | null;
  covers_from: string | null;
  covers_to: string | null;
  sessions_covered: number | null;
  note: string | null;
  created_at: string;
};

type PaymentsMonthlySectionProps = {
  studentId: string;
  payments: Payment[];
  studentCreditPence: number;
  currencyCode: SupportedCurrencyCode;
  initialMonthKey: string;
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
  studentCreditPence,
  currencyCode,
  initialMonthKey,
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
              Record payments here if you take upfront or bulk payments. Otherwise, just mark lessons as paid.
            </p>
          </div>
          <RecordPaymentForm studentId={studentId} currencyCode={currencyCode} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Credit available</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {formatCurrencyFromMinorUnits(studentCreditPence, currencyCode)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Received but not yet used for lessons.</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Payments received</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
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
                    <PaymentRecordActions studentId={studentId} currencyCode={currencyCode} payment={payment} />
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
