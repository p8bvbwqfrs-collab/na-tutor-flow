import { headers } from "next/headers";
import { canUseCalendarFeeds, generateCalendarFeedToken } from "@/lib/calendar-feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "../../components/logout-button";
import { CopyFeedLinkButton } from "./components/copy-feed-link-button";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
        Account details and a simple home for calendar subscription tools.
      </p>

      <div className="mt-6 space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Account</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Basic account details and sign-out access.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</p>
              <p className="mt-2 text-sm text-zinc-900">{user?.email ?? "No email available"}</p>
            </div>
            <div className="w-fit">
              <LogoutButton />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-medium text-zinc-900">Calendar sync</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Subscribe to your tutoring calendar in Apple Calendar or another calendar app.
          </p>

          <div className="mt-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tutoring calendar
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                See upcoming lessons and completed lesson history in your calendar app.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href={feedsAvailable ? addToCalendarUrl : "#"}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-zinc-300"
                  aria-disabled={!feedsAvailable}
                >
                  Add to calendar
                </a>
                <CopyFeedLinkButton
                  url={tutoringFeedUrl}
                  label="Copy link"
                  unavailable={!feedsAvailable}
                />
              </div>
              <details className="mt-3 text-sm text-zinc-600">
                <summary className="cursor-pointer select-none text-sm font-medium text-zinc-700 hover:text-zinc-900">
                  How this works
                </summary>
                <p className="mt-2 text-sm text-zinc-600">
                  Subscribe once to keep your tutoring lessons updated in your calendar app. Upcoming lessons and completed lesson history will appear in one place. Updates may not appear instantly depending on your calendar provider.
                </p>
              </details>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
