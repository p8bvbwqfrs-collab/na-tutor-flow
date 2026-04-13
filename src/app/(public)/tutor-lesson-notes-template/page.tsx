import type { Metadata } from "next";
import Link from "next/link";
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
          <p>
            If you tutor regularly, a tutor lesson notes template can make a big difference.
          </p>
          <p>
            You finish a session, think you’ll remember everything, and then later you’re trying
            to piece together what you covered, what went well, and what to do next.
          </p>
          <p>
            This is a simple tutor lesson notes template you can use after each session to keep
            things clear and consistent.
          </p>
        </>
      }
    >
      <PublicSection title="Template">
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

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          <p className="font-medium text-zinc-900">Ava – lesson notes (12 Feb)</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium text-zinc-900">Focus today</p>
              <ul className="mt-2 space-y-1">
                <li>• Algebraic fractions</li>
                <li>• Rearranging formulas</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">What went well</p>
              <ul className="mt-2 space-y-1">
                <li>• More confident with substitution steps</li>
                <li>• Better pace through exam-style questions</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Area to improve</p>
              <ul className="mt-2 space-y-1">
                <li>• Slowing down when simplifying at the end</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Homework</p>
              <ul className="mt-2 space-y-1">
                <li>• Finish the algebraic fractions sheet</li>
                <li>• Bring one tricky question to the next lesson</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p>Effort: 4/5</p>
              <p>Confidence: 3/5</p>
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection title="Who this template is for">
        <ul className="space-y-1">
          <li>• GCSE tutors</li>
          <li>• A-level tutors</li>
          <li>• Private tutors working one-to-one</li>
          <li>• Online or in-person tutors</li>
        </ul>
      </PublicSection>

      <PublicSection title="Why this helps">
        <p>
          A simple structure like this makes it much easier to stay consistent across lessons. It
          also gives you something you can look back on quickly before the next session.
        </p>
        <p>
          It can also make it much easier to turn your notes into a{" "}
          <Link
            href="/how-to-write-parent-updates-after-tutoring"
            className="font-medium text-zinc-900 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            parent update
          </Link>{" "}
          and stay on top of{" "}
          <Link
            href="/tutor-payment-tracker"
            className="font-medium text-zinc-900 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            payment tracking
          </Link>{" "}
          alongside the lesson itself.
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
              You log the lesson once, and it turns into a clear{" "}
              <Link
                href="/how-to-write-parent-updates-after-tutoring"
                className="font-medium text-zinc-900 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                parent update
              </Link>{" "}
              automatically, with everything saved against the student.
            </p>
          </>
        }
      />

      <PublicSection title="FAQs">
        <div>
          <p className="font-medium text-zinc-900">Do I need to write lesson notes after every session?</p>
          <p className="mt-1">
            Even short notes help track progress and make future sessions easier to plan.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-900">Can I send this to parents?</p>
          <p className="mt-1">
            Yes — you can use this structure directly or turn it into a parent update.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-900">What should I include in tutor lesson notes?</p>
          <p className="mt-1">
            Focus on what was covered, what went well, areas to improve, and next steps.
          </p>
        </div>
      </PublicSection>

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
