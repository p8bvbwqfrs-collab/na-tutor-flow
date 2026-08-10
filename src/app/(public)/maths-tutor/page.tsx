import type { Metadata } from "next";
import Link from "next/link";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Naz – Online GCSE & A-level Maths Tutor",
  description:
    "Calm, supportive online GCSE, A-level and Further Maths tutoring from an experienced Head of Maths.",
  path: "/maths-tutor",
  absoluteTitle: true,
});

const enquiryHref =
  "mailto:natutorflow@gmail.com?subject=Maths%20tuition%20enquiry";

const featuredReviews = [
  {
    quote:
      "Naz was amazing, helping my son through his maths A-level last year. His tutoring style was supportive, but also provided the right level of challenge and helped my son ultimately achieve an A in his exams. Additionally, in the words of my son, “Naz is a lovely guy”.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2019",
  },
  {
    quote:
      "Naresh tutored my son for his A level maths exam and we thought he was excellent. The tutoring was virtual, via Skype and a live board, rather than face to face, which worked well, and Naresh was very helpful in assisting my son in the areas he was struggling with. My son felt so much more confident and better prepared for his exam and we would highly recommend Naresh as a tutor.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2020",
  },
  {
    quote:
      "Naz has been helping my daughter with her A'level Maths. She has made good progress with his guidance. He communicates very well with students and parents, providing detailed feedback on progress. Would highly recommend.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2025",
  },
] as const;

const moreReviews = [
  {
    quote:
      "My daughter is struggling with her A-level maths regardless how hard she tried. I am so glad that I found Naz at First Tutors. Very often, my daughter happily told me that Naz has taught and guided her with new techniques to solve some tricky questions. This has inspired her to stay motivated when learning maths at school. Overall, Naz is a very patient tutor and he communicates very well with parents.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2024",
  },
  {
    quote:
      "Naz has started helping my son with his maths A-level. His tutoring style is calm & supportive. He is always asking my son if he understands what the question requires of him. Naz also suggests alternative ways in which he can can answer certain questions. My son hopes to benefit from Naz's help & guidance throughout the year.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2021",
  },
  {
    quote:
      "My son started A level maths tuition a month ago to catch up on topics that he found difficult. He is happy with how the things are clearly explained and easy to understand. The online whiteboard that Naresh uses during lessons makes explaining and illustrating concepts easy as well as helps communicating methods and areas for improvement. After having 8 lessons my son feels more confident and well prepared for exams.",
    attribution: "Parent of an A-level Maths student — originally published on First Tutors, 2023",
  },
  {
    quote:
      "Naz has been helping my younger brother with A-level Maths. Younger brother thoroughly enjoys his sessions, which are interactive and are planned meticulously. Naz's sessions are easy to follow, yet still push and challenge younger brother's ability.",
    attribution: "Family member of an A-level Maths student — originally published on First Tutors, 2020",
  },
  {
    quote:
      "Naz is an excellent teacher, my son is much more Confident with Maths now and we are looking forward to continue with him",
    attribution: "Parent of a Maths student — originally published on First Tutors, 2019",
  },
  {
    quote:
      "Naz is a super tutor. He has already developed an understanding of the student's requirements and is working with her to reach her goals. I have no hesitation in recommending Naz.",
    attribution: "Parent of a Maths student — originally published on First Tutors, 2018",
  },
] as const;

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-blue-800"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ReviewCard({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex gap-1 text-zinc-700" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} aria-hidden="true">
            ★
          </span>
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-6 text-zinc-700">“{quote}”</blockquote>
      <figcaption className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-5 text-zinc-600">
        {attribution}
      </figcaption>
    </figure>
  );
}

export default function MathsTutorPage() {
  return (
    <article className="mx-auto max-w-5xl space-y-6 py-6 sm:space-y-8 sm:py-10">
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50/50 p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
              Online GCSE, A-level &amp; Further Maths tuition
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Online maths tuition from an experienced Head of Maths
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Clear, supportive tuition for students who want to strengthen their understanding,
              build confidence and approach their exams with a reliable plan.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={enquiryHref}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Discuss tuition
              </Link>
              <p className="text-sm font-medium text-zinc-600">Limited availability for September 2026</p>
            </div>
          </div>

          <aside className="rounded-lg border border-blue-100 bg-white/80 p-5" aria-label="Tutor profile summary">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">At a glance</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Experienced classroom leadership</strong>Head of Maths at a high-performing secondary school with sixth form.</span></li>
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Proven teaching experience</strong>More than 10 years&apos; experience teaching and tutoring students across the ability range.</span></li>
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Strong subject knowledge</strong>Mathematics degree and Secondary Mathematics PGCE from the University of Warwick.</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["GCSE Maths", "Close gaps in understanding, strengthen core skills and develop the exam technique needed to turn knowledge into marks."],
          ["A-level Maths", "Build confidence and fluency across pure mathematics, statistics and mechanics through clear explanation and carefully chosen practice."],
          ["Further Maths", "Develop a deeper understanding of demanding topics and learn how to approach unfamiliar, multi-step problems with confidence."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Teaching approach</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Lessons built around how each student learns</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">
              <p>Every student arrives with different strengths, gaps and goals. Lessons are tailored accordingly, combining clear explanation with active problem-solving and carefully chosen questions.</p>
              <p>A shared online whiteboard allows us to work through methods together, revisit earlier steps and identify exactly where misunderstandings arise. Students are encouraged to ask questions, explain their reasoning and become increasingly independent.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Exam preparation</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Preparation that turns understanding into performance</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">
              <p>Effective exam preparation is about more than completing past papers. We identify the topics that will make the greatest difference, develop reliable approaches to common question types and practise working accurately under exam conditions.</p>
              <p>Parents receive clear, useful feedback about progress, current priorities and the most helpful next steps between lessons.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8" aria-labelledby="reviews-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Testimonials</p>
          <h2 id="reviews-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Nine 5-star reviews from parents
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">Feedback collected through First Tutors between 2018 and 2025 from families supported through online maths tuition.</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {featuredReviews.map((review) => <ReviewCard key={review.attribution} {...review} />)}
        </div>

        <details className="group mt-5 rounded-lg border border-zinc-200 bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            See all nine parent reviews
            <span className="text-lg text-zinc-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="grid gap-4 border-t border-zinc-200 p-4 md:grid-cols-2">
            {moreReviews.map((review) => <ReviewCard key={review.attribution + review.quote.slice(0, 20)} {...review} />)}
          </div>
        </details>
      </section>

      <section className="rounded-lg border border-blue-950 bg-blue-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-300">Online GCSE, A-level and Further Maths tuition</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">From £50 per hour</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Regular online lessons tailored to the student&apos;s current level, goals and examination course.</p>
          </div>
          <Link
            href={enquiryHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-blue-950 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
          >
            Enquire about tuition
          </Link>
        </div>
      </section>
    </article>
  );
}
