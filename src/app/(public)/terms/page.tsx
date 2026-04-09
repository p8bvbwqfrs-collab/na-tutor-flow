export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base">
          These terms explain the basic rules for using Tutor Flow. They are intentionally simple
          and designed for an early-stage product.
        </p>
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Description of service</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Tutor Flow is a software tool for tutors to log lessons, organise schedules, manage
            follow-up, and keep tutoring admin in one place.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Use at your own risk</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            We aim to provide a reliable service, but Tutor Flow is offered as-is. We cannot
            guarantee uninterrupted access, error-free operation, or that the service will always
            meet every specific need.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Your responsibility for content</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            You are responsible for the information you add to Tutor Flow, including lesson notes,
            student details, and messages you send using the service.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Changes to the service</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            We may update, change, pause, or remove parts of the service as the product evolves.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Limitation of liability</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            To the fullest extent allowed by law, we are not liable for indirect, incidental, or
            consequential loss arising from your use of Tutor Flow.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Contact</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            If you have questions about these terms, contact:{" "}
            <span className="font-medium">natutorflow@gmail.com</span>
          </p>
        </section>
      </div>
    </section>
  );
}
