import type { Metadata } from "next";
import {
  PublicContentPage,
  PublicSection,
  ResourceLinksSection,
  PublicCtaSection,
} from "../components/public-content-page";

export const metadata: Metadata = {
  title: "Tutor Payment Tracker | Tutor Flow",
  description:
    "A simple tutor payment tracker to keep lesson fees, paid sessions, and unpaid lessons organised without messy spreadsheets.",
};

export default function TutorPaymentTrackerPage() {
  return (
    <PublicContentPage
      title="Tutor Payment Tracker"
      intro={
        <>
          <p>
            Keeping track of tutoring payments sounds simple, but it gets confusing surprisingly
            quickly.
          </p>
          <p>
            Which sessions have been paid? Which ones haven’t? Was that bank transfer for last
            week or this week?
          </p>
          <p>If you’re tutoring regularly, you need a simple way to keep everything clear.</p>
        </>
      }
    >
      <PublicSection title="What to track">
        <p>A basic tutor payment tracker should include:</p>
        <ul className="space-y-1">
          <li>• Student name</li>
          <li>• Lesson date</li>
          <li>• Fee</li>
          <li>• Paid or unpaid status</li>
          <li>• Optional notes</li>
        </ul>
      </PublicSection>

      <PublicSection title="Why spreadsheets get messy">
        <p>
          Spreadsheets can work at first, but once you have multiple students and regular sessions,
          it becomes harder to match payments to lessons and see what still needs attention.
        </p>
      </PublicSection>

      <PublicSection title="What a better system looks like">
        <p>
          The easiest setup is one where payments stay linked to the lesson itself, so you can see
          the student, the date, the fee, and whether it has been paid without jumping between
          tools.
        </p>
      </PublicSection>

      <PublicCtaSection
        title="How Tutor Flow helps"
        ctaLabel="Try Tutor Flow"
        ctaHref="https://www.natutorflow.com"
        body={
          <p>
            Tutor Flow keeps this connected automatically. When you log a lesson, you can mark it
            as paid or unpaid, and everything stays linked to the student, lesson history, and
            upcoming work.
          </p>
        }
      />

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
