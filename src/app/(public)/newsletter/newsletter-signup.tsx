import Link from "next/link";

type NewsletterSignupProps = {
  compact?: boolean;
};

export function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const signupUrl = process.env.NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL;

  return (
    <aside
      aria-labelledby={compact ? "newsletter-signup-compact" : "newsletter-signup"}
      className={
        compact
          ? "rounded-xl border border-blue-100 bg-blue-50 p-5 sm:p-6"
          : "rounded-xl border border-blue-100 bg-blue-50 p-6 sm:p-8"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
        Tutor Flow Notes
      </p>
      <h2
        id={compact ? "newsletter-signup-compact" : "newsletter-signup"}
        className={`${compact ? "mt-2 text-lg" : "mt-2 text-xl"} font-semibold text-zinc-900`}
      >
        One useful idea for independent tutors each month
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-700">
        Short, practical notes on lesson records, parent communication, payments and running a
        calmer tutoring workflow. No student data, no daily emails and no spam.
      </p>

      {signupUrl ? (
        <div className="mt-5">
          <a
            href={signupUrl}
            rel="noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
          >
            Join Tutor Flow Notes
          </a>
          <p className="mt-3 text-xs leading-5 text-zinc-600">
            By submitting the separate form, you&apos;re choosing to join Tutor Flow Notes. You can
            unsubscribe at any time. See the{" "}
            <Link
              href="/privacy"
              className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-zinc-800">
          Email sign-up is opening soon. The public notes will always remain free to read here.
        </p>
      )}
    </aside>
  );
}
