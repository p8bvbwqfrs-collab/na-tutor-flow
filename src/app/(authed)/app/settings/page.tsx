import Link from "next/link";
import { headers } from "next/headers";
import { SectionHeading } from "@/components/section-heading";
import { canUseCalendarFeeds, generateCalendarFeedToken } from "@/lib/calendar-feed";
import { TUTOR_FLOW_CONTACT_EMAIL, TUTOR_FLOW_FEEDBACK_EMAIL_HREF } from "@/lib/contact";
import {
  getUserCalendarFeedVersion,
  getUserCurrencyCode,
  getUserTimeZone,
} from "@/lib/user-settings";
import { secondaryAction } from "@/lib/ui-patterns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarFeedControls } from "./components/calendar-feed-controls";
import { AccountSecurityControls } from "./components/account-security-controls";
import { AccountDeletionControls } from "./components/account-deletion-controls";
import { AccountDataExportControls } from "./components/account-data-export-controls";
import { CurrencySettingsForm } from "./components/currency-settings-form";
import { TimeZoneSettingsForm } from "./components/time-zone-settings-form";
import { ShareTutorFlow } from "./components/share-tutor-flow";

type SettingsPageProps = {
  searchParams: Promise<{ calendar_reset?: string; email_changed?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const [userResult, currencyCode, timeZone, calendarFeedVersion, resolvedSearchParams] =
    await Promise.all([
      supabase.auth.getUser(),
      getUserCurrencyCode(supabase),
      getUserTimeZone(supabase),
      getUserCalendarFeedVersion(supabase),
      searchParams,
    ]);
  const user = userResult.data.user;
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const baseUrl = host ? `${protocol}://${host}` : "";
  const feedsAvailable = Boolean(user?.id && baseUrl && canUseCalendarFeeds());
  const tutoringFeedUrl =
    feedsAvailable && user?.id
      ? `${baseUrl}/api/calendar/tutoring?token=${generateCalendarFeedToken(
          user.id,
          "tutoring",
          calendarFeedVersion,
        )}`
      : "";
  const tutoringWebcalUrl = tutoringFeedUrl.replace(/^https?:\/\//, "webcal://");
  const isLocalHost =
    baseUrl.startsWith("http://localhost") ||
    baseUrl.startsWith("http://127.0.0.1") ||
    baseUrl.startsWith("http://0.0.0.0");
  const addToCalendarUrl = isLocalHost ? tutoringFeedUrl : tutoringWebcalUrl;

  return (
    <section>
      <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>

      {resolvedSearchParams.calendar_reset === "1" ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        >
          Your private calendar link was reset. Subscribe again wherever you want calendar updates.
        </p>
      ) : null}

      {resolvedSearchParams.email_changed === "1" ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        >
          Your sign-in email address was updated.
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h2 className="text-base font-medium text-zinc-900">Account</h2>
            <div className="min-w-0 text-sm sm:text-right">
              <span className="text-zinc-500">Signed in as </span>
              <span className="break-all font-medium text-zinc-900">{user?.email ?? "No email available"}</span>
            </div>
          </div>
          {user?.email ? <AccountSecurityControls accountEmail={user.email} /> : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionHeading
            title="Preferences"
            description="Choose how fees, totals and lesson times are shown across the app."
          />

          {user ? (
            <>
              <CurrencySettingsForm userId={user.id} initialCurrencyCode={currencyCode} />
              <TimeZoneSettingsForm userId={user.id} initialTimeZone={timeZone} />
            </>
          ) : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionHeading
            title="Calendar sync"
            description="Subscribe once to keep tutoring lessons visible in your preferred calendar app. Updates made in Tutor Flow will appear automatically."
          />

          <div className="mt-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tutoring calendar
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                View upcoming and completed lessons in a read-only calendar subscription.
              </p>
              <CalendarFeedControls
                feedUrl={tutoringFeedUrl}
                subscribeUrl={addToCalendarUrl}
                unavailable={!feedsAvailable}
              />
              <p className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                This is a private calendar link. Anyone with the link may be able to view your
                lesson schedule, so do not share it. Reset it here if you think someone else has
                access.
              </p>
              <details className="mt-3 text-sm text-zinc-600">
                <summary className="cursor-pointer select-none text-sm font-medium text-zinc-700 hover:text-zinc-900">
                  How this works
                </summary>
                <div className="mt-2 space-y-2 text-sm leading-6 text-zinc-600">
                  <p>
                    The subscription is read-only. It includes upcoming and completed lessons,
                    showing the student name, lesson time and saved lesson details. Cancelled
                    lessons are not included.
                  </p>
                  <p>
                    Tutor Flow updates the feed when lesson information changes. Your calendar app
                    checks the feed on its own schedule, so changes may not appear immediately.
                  </p>
                  <p>
                    To remove the subscription, delete or unsubscribe from the Tutoring calendar
                    inside your calendar app.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionHeading
            title="Tutor Flow Notes"
            description="Choose separately whether you want the occasional Tutor Flow newsletter. Your account email is never added automatically."
          />
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-900">Newsletter preference</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
                Join using the separate form, or use the unsubscribe link in any newsletter email
                to leave at any time.
              </p>
            </div>
            <Link
              href="/newsletter#newsletter-signup"
              className={secondaryAction + " w-full shrink-0 sm:w-auto"}
            >
              Join or manage newsletter
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionHeading
            title="Help improve Tutor Flow"
            description="Share Tutor Flow with another independent tutor, or tell me what feels confusing, missing or slower than it should be."
          />
          <div className="mt-4 space-y-4">
            <ShareTutorFlow />
            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">Recent improvements</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  See a short, tutor-facing record of meaningful changes as Tutor Flow develops.
                </p>
              </div>
              <Link href="/updates" className={secondaryAction + " w-full shrink-0 sm:w-auto"}>
                See what&apos;s new
              </Link>
            </div>
            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">Have feedback?</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Feedback goes directly to{" "}
                  <span className="font-medium text-zinc-900">{TUTOR_FLOW_CONTACT_EMAIL}</span>.
                </p>
              </div>
              <a
                href={TUTOR_FLOW_FEEDBACK_EMAIL_HREF}
                className={secondaryAction + " w-full shrink-0 sm:w-auto"}
              >
                Send feedback by email
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <SectionHeading
            title="Your data"
            description="Download a portable copy of the information saved in Tutor Flow, including active and archived students, lessons, payments and preferences."
          />
          <AccountDataExportControls />
          {user?.email ? <AccountDeletionControls accountEmail={user.email} /> : null}
        </section>
      </div>
    </section>
  );
}
