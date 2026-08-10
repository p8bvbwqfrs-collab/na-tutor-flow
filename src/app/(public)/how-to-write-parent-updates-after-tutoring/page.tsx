import type { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";
import {
  PublicContentPage,
  PublicFaqSection,
  PublicSection,
  ResourceLinksSection,
  PublicCtaSection,
} from "../components/public-content-page";
import { CopyResourceButton } from "../components/resource-actions";

export const metadata: Metadata = createPublicMetadata({
  title: "How to Write Parent Updates After Tutoring",
  description:
    "A simple way to write clear parent updates after tutoring, with examples of what to include after each lesson.",
  path: "/how-to-write-parent-updates-after-tutoring",
  type: "article",
});

const parentUpdateExample = `Harris – lesson update (31 Mar)

Harris was much more confident today which was great to see.

Today we worked on
• Equations of motion
• Exam questions involving force
• Connected particles – trickier questions

What went well
• Strong understanding of mechanics
• Better simplification of complex equations

Next focus
• Continued practice simplifying equations
• Checking all parts are resolved when angles are involved

Homework
• Practise further exam questions

Effort: 5/5
Confidence: 4/5
Next lesson scheduled: 7 Apr at 16:00`;

export default function HowToWriteParentUpdatesAfterTutoringPage() {
  return (
    <PublicContentPage
      category="Parent communication"
      title="How to Write Parent Updates After Tutoring"
      resource="parent-updates"
      primaryAction={
        <CopyResourceButton
          copyText={parentUpdateExample}
          resource="parent-updates"
          action="copy_example"
          label="Copy the parent update example"
        />
      }
      intro={
        <>
          <p>
            After a tutoring session, writing an update for parents can feel repetitive.
          </p>
          <p>
            You know what you covered, but turning that into something clear and useful takes time,
            especially if you’re doing it after multiple lessons.
          </p>
        </>
      }
    >
      <PublicSection title="What a good parent update should include">
        <p>A useful parent update usually covers:</p>
        <ul className="space-y-1">
          <li>• What you worked on</li>
          <li>• What went well</li>
          <li>• What still needs work</li>
          <li>• Homework or next steps</li>
          <li>• Effort and confidence</li>
        </ul>
      </PublicSection>

      <PublicSection title="Example parent update">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          <p className="font-medium text-zinc-900">Harris – lesson update (31 Mar)</p>
          <p className="mt-4">
            Harris was much more confident today which was great to see.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium text-zinc-900">Today we worked on</p>
              <ul className="mt-2 space-y-1">
                <li>• Equations of motion</li>
                <li>• Exam questions involving force</li>
                <li>• Connected particles – trickier questions</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">What went well</p>
              <ul className="mt-2 space-y-1">
                <li>• Strong understanding of mechanics</li>
                <li>• Better simplification of complex equations</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Next focus</p>
              <ul className="mt-2 space-y-1">
                <li>• Continued practice simplifying equations</li>
                <li>• Checking all parts are resolved when angles are involved</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Homework</p>
              <ul className="mt-2 space-y-1">
                <li>• Practise further exam questions</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p>Effort: 5/5</p>
              <p>Confidence: 4/5</p>
              <p>Next lesson scheduled: 7 Apr at 16:00</p>
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection title="Why consistency matters">
        <p>
          Parents usually do not need a long report. They just want a clear sense of what was
          covered, how things went, and what happens next.
        </p>
        <p>A simple structure makes this much easier to do well every time.</p>
      </PublicSection>

      <PublicCtaSection
        resource="parent-updates"
        title="How Tutor Flow helps"
        ctaLabel="Try Tutor Flow"
        ctaHref="/signup"
        body={
          <p>
            Tutor Flow turns your lesson notes into this kind of update automatically, so you can
            copy or share it straight into WhatsApp, Messages, or email in seconds.
          </p>
        }
      />

      <PublicFaqSection
        items={[
          {
            question: "How long should a parent update be?",
            answer: (
              <p>
                Keep it brief enough to scan. A few clear lines on the lesson, progress, and next
                steps are usually more useful than a long report.
              </p>
            ),
          },
          {
            question: "Should I send an update after every lesson?",
            answer: (
              <p>
                Regular short updates build trust and reduce catch-up later. Agree a rhythm that
                suits the family if a message after every lesson would be unnecessary.
              </p>
            ),
          },
          {
            question: "Can I use this for email or WhatsApp?",
            answer: (
              <p>
                Yes. The structure is designed to work as a short email, WhatsApp message, or
                record you keep against the student.
              </p>
            ),
          },
        ]}
      />

      <ResourceLinksSection
        links={[
          { href: "/tutor-lesson-notes-template", label: "Tutor lesson notes template" },
          { href: "/tutor-payment-tracker", label: "Tutor payment tracker" },
        ]}
      />
    </PublicContentPage>
  );
}
