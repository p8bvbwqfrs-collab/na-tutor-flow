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
  title: "Free Tutor Parent Update Template & Example",
  description:
    "Copy a free tutor parent update template for WhatsApp or email, with a realistic after-lesson example, clear structure, progress and next steps.",
  path: "/how-to-write-parent-updates-after-tutoring",
  type: "article",
});

const parentUpdateTemplate = `Hi [Parent or guardian name],

A quick update after [Student name]’s lesson today. We worked on [topic or skill].

[Student name] did well with [specific success]. We’ll keep working on [area to improve or next focus].

[Homework or useful next step, if there is one.]

Next lesson: [date and time, if arranged]

Best,
[Your name]`;

export default function HowToWriteParentUpdatesAfterTutoringPage() {
  return (
    <PublicContentPage
      category="Parent communication"
      title="Free Parent Update Template for Tutors"
      resource="parent-updates"
      primaryAction={
        <CopyResourceButton
          copyText={parentUpdateTemplate}
          resource="parent-updates"
          action="copy_example"
          label="Copy the free parent update template"
        />
      }
      intro={
        <>
          <p>
            Copy and adapt this free parent update template after a tutoring lesson. It works as a
            short WhatsApp message or email and does not require an account.
          </p>
          <p>
            Use it to tell a parent what you covered, what their child did well, what needs more
            work, and what happens next—without turning every lesson into a long report.
          </p>
        </>
      }
    >
      <PublicSection title="Free copy-and-paste parent update template">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 whitespace-pre-line">
          {parentUpdateTemplate}
        </div>
        <p className="text-xs leading-5 text-zinc-500">
          Replace the square-bracketed prompts, remove anything that is not useful, and check the
          message before sending it to the parent or guardian.
        </p>
      </PublicSection>

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

      <PublicSection title="A realistic tutor parent update example">
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

      <PublicSection title="When to use a lesson update or a progress report">
        <p>
          Use a short parent update for the useful details from one lesson. A monthly or termly
          progress report is better for recurring themes, changes over time, and wider goals.
        </p>
        <p>
          Keeping the lesson messages brief gives parents timely information without repeating the
          same detail when you later write a broader progress summary.
        </p>
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
