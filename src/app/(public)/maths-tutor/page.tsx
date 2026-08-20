import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { createPublicMetadata } from "@/lib/seo";
import { surfacePanel } from "@/lib/ui-patterns";
import { MathsTuitionEnquiryLink } from "./maths-tuition-enquiry-link";

export const metadata: Metadata = createPublicMetadata({
  title: "Naz – Online GCSE & A-level Maths Tutor",
  description:
    "Calm, supportive online GCSE, A-level and Further Maths tutoring from an experienced Head of Maths.",
  path: "/maths-tutor",
  absoluteTitle: true,
});

const enquiryHref =
  "mailto:natutorflow@gmail.com?subject=Maths%20tuition%20enquiry&body=Student%20level%20or%20course%3A%0AWhat%20support%20would%20be%20most%20helpful%3F%0APreferred%20lesson%20times%3A%0A";

const lessonSteps = [
  {
    title: "Find the starting point",
    copy: "Identify current strengths, gaps and the topics that will make the greatest difference.",
  },
  {
    title: "Work through it together",
    copy: "Use a shared whiteboard to make each step visible and resolve misconceptions clearly.",
  },
  {
    title: "Build independence",
    copy: "Develop fluency, exam judgement and confidence through carefully chosen questions.",
  },
] as const;

const faqs = [
  {
    question: "Which maths courses do you support?",
    answer:
      "Online tuition is available for GCSE Maths, A-level Maths and Further Maths. The starting point is always the student's current course, confidence and priorities.",
  },
  {
    question: "How do online lessons work?",
    answer:
      "Lessons use a shared online whiteboard so methods can be modelled, attempted together and revisited. This makes each step visible and gives the student an active role throughout.",
  },
  {
    question: "How much does tuition cost?",
    answer:
      "Regular online tuition starts from £50 per hour. The exact arrangement is confirmed before lessons begin.",
  },
  {
    question: "What should I include in an enquiry?",
    answer:
      "A short note about the student's level or course, the support they need and suitable lesson times is enough to start a conversation.",
  },
] as const;

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
    <figure className="flex h-full flex-col border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:first:border-l-0 lg:first:pl-0">
      <div className="flex gap-1 text-blue-700" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} aria-hidden="true">
            ★
          </span>
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-6 text-zinc-700">“{quote}”</blockquote>
      <figcaption className="mt-4 text-xs leading-5 text-zinc-500">
        {attribution}
      </figcaption>
    </figure>
  );
}

export default function MathsTutorPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: "Online GCSE, A-level and Further Maths tuition",
              url: "https://www.natutorflow.com/maths-tutor",
              description:
                "Calm, supportive online GCSE, A-level and Further Maths tutoring from an experienced Head of Maths.",
              areaServed: "GB",
              provider: { "@type": "Person", name: "Naz", jobTitle: "Head of Maths" },
              offers: {
                "@type": "Offer",
                priceCurrency: "GBP",
                price: "50",
                description: "Online tuition from £50 per hour",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ],
        }}
      />
      <article className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-10">
        <section className={surfacePanel + " overflow-hidden"}>
        <div className="grid gap-8 bg-gradient-to-br from-blue-50 via-white to-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 sm:text-sm">
              Online GCSE, A-level &amp; Further Maths tuition
            </p>
            <h1 className="mt-3 max-w-[18ch] text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Calm, expert maths tuition that builds confidence
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Clear explanations, purposeful practice and honest feedback from an experienced
              Head of Maths—shaped around the student, their course and their goals.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MathsTuitionEnquiryLink href={enquiryHref} placement="hero">
                Discuss tuition
              </MathsTuitionEnquiryLink>
              <p className="text-sm text-zinc-600">Limited weekly availability</p>
            </div>
          </div>

          <aside className="rounded-xl border border-blue-100 bg-white p-5 shadow-[var(--shadow-panel)]" aria-label="About your tutor">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-semibold text-white" aria-hidden="true">N</div>
              <div>
                <p className="text-lg font-semibold text-zinc-950">Naz</p>
                <p className="text-sm text-zinc-600">Online maths tutor</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 border-t border-zinc-200 pt-5 text-sm leading-6 text-zinc-700">
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Experienced classroom leadership</strong>Head of Maths at a high-performing secondary school with sixth form.</span></li>
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Proven teaching experience</strong>More than 10 years&apos; experience teaching and tutoring students across the ability range.</span></li>
              <li className="flex gap-3"><CheckIcon /><span><strong className="block font-semibold text-zinc-900">Strong subject knowledge</strong>Mathematics degree and Secondary Mathematics PGCE from the University of Warwick.</span></li>
            </ul>
          </aside>
        </div>
        <div className="grid border-t border-zinc-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-zinc-200">
          {["Online lessons", "GCSE to Further Maths", "Clear parent feedback"].map((item) => (
            <p key={item} className="border-t border-zinc-100 px-5 py-3 text-center text-sm font-medium text-zinc-700 first:border-t-0 sm:border-t-0">{item}</p>
          ))}
        </div>
        </section>

      <section aria-labelledby="tuition-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tuition</p>
          <h2 id="tuition-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Support matched to the course</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">Start with the student&apos;s current understanding, then focus time where it will be most useful.</p>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-panel)] md:grid md:grid-cols-3 md:divide-x md:divide-zinc-200">
          {[
          ["GCSE Maths", "Close gaps in understanding, strengthen core skills and develop the exam technique needed to turn knowledge into marks."],
          ["A-level Maths", "Build confidence and fluency across pure mathematics, statistics and mechanics through clear explanation and carefully chosen practice."],
          ["Further Maths", "Develop a deeper understanding of demanding topics and learn how to approach unfamiliar, multi-step problems with confidence."],
        ].map(([title, copy]) => (
          <div key={title} className="border-t border-zinc-200 p-5 first:border-t-0 md:border-t-0 sm:p-6">
            <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
          </div>
        ))}
        </div>
      </section>

      <section className={surfacePanel + " p-6 sm:p-8"} aria-labelledby="lessons-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">How lessons work</p>
            <h2 id="lessons-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Clear progress, one step at a time</h2>
            <ol className="mt-6 space-y-5">
              {lessonSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700" aria-hidden="true">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-zinc-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="rounded-xl bg-blue-50 p-5 sm:p-6">
            <p className="text-sm font-semibold text-blue-900">For students and parents</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Challenge without unnecessary pressure</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-700">Students are encouraged to ask questions, explain their reasoning and develop reliable approaches—not simply copy a method.</p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">Parents receive useful feedback on progress, current priorities and the most helpful next steps between lessons.</p>
          </aside>
        </div>
      </section>

      <section className={surfacePanel + " p-6 sm:p-8"} aria-labelledby="reviews-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Parent feedback</p>
          <h2 id="reviews-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Trusted by families over time
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">Nine verified 5-star reviews published on First Tutors between 2018 and 2025.</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {featuredReviews.map((review) => <ReviewCard key={review.attribution} {...review} />)}
        </div>

        <details className="group mt-6 border-t border-zinc-200 pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-2 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            Read all nine parent reviews
            <span className="text-lg text-zinc-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="mt-3 grid gap-5 border-t border-zinc-200 pt-5 md:grid-cols-2">
            {moreReviews.map((review) => <ReviewCard key={review.attribution + review.quote.slice(0, 20)} {...review} />)}
          </div>
        </details>
      </section>

      <section aria-labelledby="tuition-faq-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Before you enquire</p>
          <h2 id="tuition-faq-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Common questions</h2>
        </div>
        <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-panel)]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 [&::-webkit-details-marker]:hidden sm:text-base">
                {faq.question}
                <span className="text-lg text-zinc-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-6 text-zinc-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-blue-950 p-6 text-white shadow-[var(--shadow-panel)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">Online GCSE, A-level and Further Maths tuition</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">From £50 per hour</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Share the student&apos;s course, what they need help with and suitable times. There is no commitment in starting the conversation.</p>
          </div>
          <MathsTuitionEnquiryLink href={enquiryHref} placement="footer" inverse>
            Enquire about tuition
          </MathsTuitionEnquiryLink>
        </div>
      </section>
      </article>
    </>
  );
}
