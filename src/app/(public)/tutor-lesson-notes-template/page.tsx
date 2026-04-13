import type { Metadata } from "next";
import {
  PublicContentPage,
  PublicSection,
  ResourceLinksSection,
  PublicCtaSection,
} from "../components/public-content-page";

export const metadata: Metadata = {
  title: "Tutor Lesson Notes Template | Tutor Flow",
  description:
    "A simple tutor lesson notes template you can use after each session to keep notes, progress, homework, and next steps organised.",
};

export default function TutorLessonNotesTemplatePage() {
  return (
    <PublicContentPage
      title="Tutor Lesson Notes Template"
      intro={
        <>
          <p>If you tutor regularly, lesson notes can quickly become a bit messy.</p>
          <p>
            You finish a session, think you’ll remember everything, and then later you’re trying
            to piece together what you covered, what went well, and what to do next.
          </p>
          <p>
            This is a simple lesson notes template you can use after each session to keep things
            clear and consistent.
          </p>
        </>
      }
    >
      <PublicSection title="A simple lesson notes template">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-medium text-zinc-900">
          <div className="space-y-3 whitespace-pre-line text-sm leading-6">
            <p>{`Student:\nDate:`}</p>
            <p>{`Focus today:\n• `}</p>
            <p>{`What went well:\n• `}</p>
            <p>{`Areas to improve:\n• `}</p>
            <p>{`Homework:\n• `}</p>
            <p>{`Effort: /5\nConfidence: /5`}</p>
          </div>
        </div>
      </PublicSection>

      <PublicSection title="Example">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          <p className="font-medium text-zinc-900">Harris – lesson update (31 Mar)</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium text-zinc-900">Focus today</p>
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
              <p className="font-medium text-zinc-900">Area to improve</p>
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
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection title="Why this helps">
        <p>
          A simple structure like this makes it much easier to stay consistent across lessons. It
          also gives you something you can look back on quickly before the next session.
        </p>
      </PublicSection>

      <PublicCtaSection
        ctaLabel="Try Tutor Flow"
        ctaHref="https://www.natutorflow.com"
        body={
          <>
            <p>
              If you’re still writing notes manually, this works well. But it still takes time to
              turn those notes into something you can send to parents and keep organised.
            </p>
            <p>
              That’s exactly why I built Tutor Flow.
            </p>
            <p>
              You log the lesson once, and it turns into a clear parent update automatically, with
              everything saved against the student.
            </p>
          </>
        }
      />

      <ResourceLinksSection
        links={[
          { href: "/tutor-payment-tracker", label: "Tutor payment tracker" },
          {
            href: "/how-to-write-parent-updates-after-tutoring",
            label: "How to write parent updates after tutoring",
          },
        ]}
      />
    </PublicContentPage>
  );
}
