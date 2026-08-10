import type { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";
import {
  PublicContentPage,
  PublicSection,
  ResourceLinksSection,
  PublicCtaSection,
} from "../components/public-content-page";

export const metadata: Metadata = createPublicMetadata({
  title: "Tutor Payment Tracker Template",
  description:
    "A free tutor payment tracker template for lesson fees, payments received, outstanding sessions, and prepaid lesson credit.",
  path: "/tutor-payment-tracker",
  type: "article",
});

const exampleRows = [
  {
    student: "Alex",
    lesson: "8 Aug",
    due: "£35",
    received: "£35",
    status: "Paid",
  },
  {
    student: "Jamie",
    lesson: "9 Aug",
    due: "£40",
    received: "—",
    status: "Outstanding",
  },
  {
    student: "Sam",
    lesson: "11 Aug",
    due: "£35",
    received: "Prepaid",
    status: "Covered by credit",
  },
] as const;

export default function TutorPaymentTrackerPage() {
  return (
    <PublicContentPage
      title="Tutor Payment Tracker Template"
      intro={
        <>
          <p>
            A tutor payment tracker should answer three questions quickly: what has been received,
            what is still outstanding, and whether a student has paid for lessons in advance.
          </p>
          <p>
            This free template gives you a simple starting point. You can use it in Excel, Google
            Sheets, or as a checklist for whichever system already runs your tutoring.
          </p>
        </>
      }
    >
      <PublicSection title="Free tutor payment tracker template">
        <p>
          Keep one row per lesson and record payments separately when the money actually arrives.
          That makes outstanding fees and advance credit easier to distinguish.
        </p>

        <div className="space-y-3" aria-label="Example tutor payment tracker">
          {exampleRows.map((row) => (
            <article key={`${row.student}-${row.lesson}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="font-medium text-zinc-900">{row.student}</p>
                  <p className="text-xs text-zinc-500">Lesson: {row.lesson}</p>
                </div>
                <span className="w-fit rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                  {row.status}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-3 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Lesson fee</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{row.due}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Payment received</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{row.received}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <a
          href="/templates/tutor-payment-tracker-template.csv"
          download
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Download the free CSV template
        </a>
        <p className="text-xs leading-5 text-zinc-500">
          The download contains clearly labelled example rows that you can replace with your own
          records.
        </p>
      </PublicSection>

      <PublicSection title="What to include for each lesson">
        <ul className="space-y-2">
          <li>• Student name</li>
          <li>• Lesson date</li>
          <li>• Lesson fee</li>
          <li>• Payment date and amount received</li>
          <li>• Paid, outstanding, or covered by credit</li>
          <li>• A short payment reference or note when needed</li>
        </ul>
        <p>
          A separate payment date matters because the date you teach and the date a parent pays
          are not always the same.
        </p>
      </PublicSection>

      <PublicSection title="A simple weekly payment workflow">
        <ol className="space-y-3">
          <li>
            <span className="font-medium text-zinc-900">1. Record each completed lesson.</span>{" "}
            Add the date and fee while the session is still fresh.
          </li>
          <li>
            <span className="font-medium text-zinc-900">2. Record money when it arrives.</span>{" "}
            Keep the amount and payment date, rather than simply changing a lesson to paid.
          </li>
          <li>
            <span className="font-medium text-zinc-900">3. Match the payment.</span>{" "}
            Apply it to the relevant outstanding lesson or keep the remainder as advance credit.
          </li>
          <li>
            <span className="font-medium text-zinc-900">4. Review once a week.</span>{" "}
            Check the outstanding list and follow up before small gaps become difficult to trace.
          </li>
        </ol>
      </PublicSection>

      <PublicSection title="How to handle advance payments">
        <p>
          If a parent pays for several lessons in one transfer, record that as one payment. Use the
          money against completed lessons first, then keep any amount left as student credit.
        </p>
        <p>
          This avoids inventing payment dates for future lessons and makes the remaining balance
          much easier to explain.
        </p>
      </PublicSection>

      <PublicSection title="When a spreadsheet starts becoming difficult">
        <p>
          A spreadsheet can work well for a small number of students. It usually becomes harder
          when students pay in advance, one payment covers several lessons, or lesson notes and
          payment records live in different places.
        </p>
        <p>
          At that point, the useful change is not a more complicated spreadsheet. It is keeping
          lessons and payments connected so totals update from the records you already make.
        </p>
      </PublicSection>

      <PublicCtaSection
        title="How Tutor Flow handles payments"
        ctaLabel="Try Tutor Flow free"
        ctaHref="/signup"
        body={
          <p>
            Tutor Flow keeps each lesson fee, payment, outstanding balance, and advance credit
            connected to the student. You can see total received for a chosen timeframe while the
            current amount outstanding remains clear.
          </p>
        }
      />

      <PublicSection title="Tutor payment tracker FAQs">
        <div>
          <p className="font-medium text-zinc-900">Should I record lessons or payments?</p>
          <p className="mt-1">
            Record both. A lesson creates the fee due; a payment records when money was actually
            received. Keeping them separate prevents mismatched dates and totals.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-900">What if one payment covers several lessons?</p>
          <p className="mt-1">
            Record one payment and match it across the relevant lessons. Any money left can remain
            as credit for a future session.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-900">Should cancelled lessons appear?</p>
          <p className="mt-1">
            Keep the cancellation in your lesson history, but only include a fee if your agreed
            cancellation policy means that payment is due.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-900">Does this replace accounting records?</p>
          <p className="mt-1">
            No. It is a practical lesson-payment record. Keep the invoices, receipts, and financial
            records required for your own accounting and tax arrangements.
          </p>
        </div>
      </PublicSection>

      <ResourceLinksSection
        links={[
          { href: "/tutor-lesson-notes-template", label: "Tutor lesson notes template" },
          {
            href: "/how-to-write-parent-updates-after-tutoring",
            label: "How to write parent updates after tutoring",
          },
        ]}
      />
    </PublicContentPage>
  );
}
