export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          A note from the builder
        </h1>
        <p className="mt-3 text-sm font-medium text-zinc-500">Built by a tutor, for tutors</p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="space-y-4 text-sm leading-6 text-zinc-600 sm:text-base">
          <p>
            I built Tutor Flow because I was finding the admin around tutoring more frustrating
            than it needed to be.
          </p>
          <p>
            The lessons themselves are the easy bit. It’s everything after — writing up notes,
            sending updates to parents, keeping track of payments, and remembering what to cover
            next — that slowly adds up and takes over your evenings.
          </p>
          <p>
            I wanted something simple that fit naturally into how I already work: log the lesson,
            send a clear update, and line up the next session without thinking about it too much.
          </p>
          <p>
            Tutor Flow is still a side project and I’m improving it as I go, based on how I use it
            and the feedback I get.
          </p>
          <p>
            If you try it and something feels off, missing, or could be better, I’d genuinely
            appreciate you letting me know.
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-medium text-zinc-900">Get in touch</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
          <span className="font-medium text-zinc-900">natutorflow@gmail.com</span>
        </p>
      </section>
    </section>
  );
}
