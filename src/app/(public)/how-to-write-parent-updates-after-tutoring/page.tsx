import type { Metadata } from "next";
import {
  PublicContentPage,
  PublicSection,
  ResourceLinksSection,
  PublicCtaSection,
} from "../components/public-content-page";

export const metadata: Metadata = {
  title: "How to Write Parent Updates After Tutoring | Tutor Flow",
  description:
    "A simple way to write clear parent updates after tutoring, with examples of what to include after each lesson.",
};

export default function HowToWriteParentUpdatesAfterTutoringPage() {
  return (
    <PublicContentPage
      title="How to Write Parent Updates After Tutoring"
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
        title="How Tutor Flow helps"
        ctaLabel="Try Tutor Flow"
        ctaHref="https://www.natutorflow.com"
        body={
          <p>
            Tutor Flow turns your lesson notes into this kind of update automatically, so you can
            copy or share it straight into WhatsApp, Messages, or email in seconds.
          </p>
        }
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
