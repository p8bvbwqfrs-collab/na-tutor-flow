import { headers } from "next/headers";
import { canUseCalendarFeeds, generateCalendarFeedToken } from "@/lib/calendar-feed";
import { getUserCurrencyCode } from "@/lib/user-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CopyFeedLinkButton } from "./components/copy-feed-link-button";
import { CurrencySettingsForm } from "./components/currency-settings-form";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const [userResult, currencyCode] = await Promise.all([
    supabase.auth.getUser(),
    getUserCurrencyCode(supabase),
  ]);
  const user = userResult.data.user;
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const baseUrl = host ? `${protocol}://${host}` : "";
  const feedsAvailable = Boolean(user?.id && baseUrl && canUseCalendarFeeds());
  const tutoringFeedUrl =
    feedsAvailable && user?.id
      ? `${baseUrl}/api/calendar/tutoring?token=${generateCalendarFeedToken(user.id, "tutoring")}`
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
      <p className="mt-1 text-sm text-zinc-600">
        Manage your account, preferences and calendar connection.
      </p>

      <div className="mt-5 space-y-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h2 className="text-base font-medium text-zinc-900">Account</h2>
            <div className="min-w-0 text-sm sm:text-right">
              <span className="text-zinc-500">Signed in as </span>
              <span className="break-all font-medium text-zinc-900">{user?.email ?? "No email available"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Preferences</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Choose how fees and totals are shown across the app.
          </p>

          {user ? (
            <CurrencySettingsForm userId={user.id} initialCurrencyCode={currencyCode} />
          ) : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Calendar sync</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Subscribe once to keep your tutoring lessons visible in your preferred calendar app.
            Updates made in Tutor Flow will appear automatically.
          </p>

          <div className="mt-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tutoring calendar
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                View upcoming and completed lessons in a read-only calendar subscription.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                <a
                  href={feedsAvailable ? addToCalendarUrl : "#"}
                  className="inline-flex min-h-10 min-w-[8.5rem] items-center justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-zinc-300"
                  aria-disabled={!feedsAvailable}
                >
                  Subscribe in calendar app
                </a>
                <CopyFeedLinkButton
                  url={tutoringFeedUrl}
                  label="Copy calendar link"
                  unavailable={!feedsAvailable}
                />
              </div>
              <p className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                This is a private calendar link. Anyone with the link may be able to view your
                lesson schedule, so do not share it.
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
      </div>
    </section>
  );
}
