type CalendarFeedResetDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  rotateTokenVersion: () => Promise<{ version: number | null; error: string | null }>;
};

export async function resetCalendarFeedLink(
  dependencies: CalendarFeedResetDependencies,
) {
  const userId = await dependencies.getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false as const,
      error: "You need to be signed in to reset your calendar link.",
    };
  }

  const result = await dependencies.rotateTokenVersion();

  if (result.error || !result.version) {
    return {
      ok: false as const,
      error: "We couldn’t reset your calendar link. Please try again.",
    };
  }

  return {
    ok: true as const,
    version: result.version,
  };
}
