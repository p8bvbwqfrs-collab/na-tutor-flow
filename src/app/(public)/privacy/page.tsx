export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base">
          Tutor Flow is a simple tool for tutors to log lessons, manage follow-up, and keep their
          tutoring admin organised. This page explains what data we collect and how we use it.
        </p>
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">What data we collect</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Account information:</span> your email
              address and any basic account details needed to sign you in and manage your account.
            </p>
            <p>
              <span className="font-medium text-zinc-900">Lesson data:</span> information you add
              to the app, such as student names, lesson notes, progress, scheduling details, and
              parent updates.
            </p>
            <p>
              <span className="font-medium text-zinc-900">Usage data:</span> basic information
              about how the app is used so we can keep it working and improve it over time.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">How we use data</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            We use your data to provide the service, keep your account working, store your lesson
            records, and improve the product over time. We do not treat your lesson content as our
            own.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Third-party services</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
            <p>
              Tutor Flow relies on a small number of third-party services to run, including
              Supabase for authentication and database storage, Vercel for hosting, and an email
              provider for account-related emails.
            </p>
            <p>
              These providers may process data on our behalf so the service works as expected.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Data ownership</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            You retain ownership of the data you add to Tutor Flow, including lesson notes and
            student information.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-900">Contact</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            If you have privacy questions, contact:{" "}
            <span className="font-medium">natutorflow@gmail.com</span>
          </p>
        </section>
      </div>
    </section>
  );
}
