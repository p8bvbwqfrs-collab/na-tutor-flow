"use client";

import { useState } from "react";
import { formatCurrencyFromMinorUnits, type SupportedCurrencyCode } from "@/lib/currency";
import { formatDateLocal, getMonthKeyLocal } from "@/lib/datetime";
import type { PaymentLike } from "@/lib/payments";
import { MonthControls } from "./month-controls";
import { PaymentRecordActions, RecordPaymentForm } from "./record-payment-form";

type Payment = PaymentLike & {
  payment_date: string | null;
  note: string | null;
  created_at: string;
};

type PaymentsMonthlySectionProps = {
  studentId: string;
  payments: Payment[];
  studentCreditPence: number;
  currencyCode: SupportedCurrencyCode;
  initialMonthKey: string;
  timeZone: string;
  readOnly?: boolean;
  embedded?: boolean;
  hasOutstandingBalance?: boolean;
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
  timeZone,
  readOnly = false,
  embedded = false,
  hasOutstandingBalance = false,
}: PaymentsMonthlySectionProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
  const paymentsForSelectedMonth = payments.filter(
    (payment) => getMonthKeyLocal(getPaymentDateValue(payment), timeZone) === selectedMonthKey,
  );
  const paymentsForSelectedMonthPence = paymentsForSelectedMonth.reduce(
    (sum, payment) => sum + payment.amount_pence,
    0,
  );

  return (
    <section id="payment-history" className="scroll-mt-24">
      <div className={embedded ? "" : "rounded-lg border border-zinc-200 bg-white p-4"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {embedded ? (
              <h3 className="text-base font-medium text-zinc-900">Payment history</h3>
            ) : (
              <h2 className="text-lg font-medium text-zinc-900">Payment history</h2>
            )}
          </div>
          {!readOnly ? (
            <RecordPaymentForm
              studentId={studentId}
              currencyCode={currencyCode}
              timeZone={timeZone}
              hasOutstandingBalance={hasOutstandingBalance}
            />
          ) : null}
        </div>
        {studentCreditPence > 0 ? (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Credit available</p>
              <p className="mt-1 text-sm font-semibold text-blue-900">
                {formatCurrencyFromMinorUnits(studentCreditPence, currencyCode)}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Already received and ready for the next outstanding lesson.
              </p>
          </div>
        ) : null}

        <div className="mt-4">
          <MonthControls
            monthKey={selectedMonthKey}
            onChange={setSelectedMonthKey}
            label={`${formatCurrencyFromMinorUnits(paymentsForSelectedMonthPence, currencyCode)} received · ${paymentsForSelectedMonth.length} ${
              paymentsForSelectedMonth.length === 1 ? "payment" : "payments"
            }`}
            timeZone={timeZone}
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
                        {formatDateLocal(getPaymentDateValue(payment), timeZone)} · {getPaymentDetail(payment)}
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
