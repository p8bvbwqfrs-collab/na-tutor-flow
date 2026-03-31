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
  const upcomingFeedUrl =
    feedsAvailable && user?.id
      ? `${baseUrl}/api/calendar/upcoming?token=${generateCalendarFeedToken(user.id, "upcoming")}`
      : "";
  const completedFeedUrl =
    feedsAvailable && user?.id
      ? `${baseUrl}/api/calendar/completed?token=${generateCalendarFeedToken(user.id, "completed")}`
      : "";

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

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Upcoming lessons calendar feed
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Subscribe to planned future lessons in Apple Calendar or another iCal-compatible app.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs break-all text-zinc-500">
                  {feedsAvailable ? upcomingFeedUrl : "Calendar feeds are not configured yet."}
                </p>
                <CopyFeedLinkButton url={upcomingFeedUrl} unavailable={!feedsAvailable} />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Completed lessons calendar feed
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Subscribe to completed lessons for a read-only history of tutoring activity.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs break-all text-zinc-500">
                  {feedsAvailable ? completedFeedUrl : "Calendar feeds are not configured yet."}
                </p>
                <CopyFeedLinkButton url={completedFeedUrl} unavailable={!feedsAvailable} />
              </div>
            </div>

            <p className="text-sm text-zinc-600">
              Subscribed calendar feeds may not refresh instantly depending on your calendar app.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
