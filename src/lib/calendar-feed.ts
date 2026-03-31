import { createHmac, timingSafeEqual } from "crypto";

export type CalendarFeedType = "upcoming" | "completed";

type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  description?: string | null;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function getCalendarFeedSecret() {
  return process.env.CALENDAR_FEED_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function canUseCalendarFeeds() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && getCalendarFeedSecret());
}

export function generateCalendarFeedToken(userId: string, feedType: CalendarFeedType) {
  const secret = getCalendarFeedSecret();

  if (!secret) {
    throw new Error("Missing calendar feed signing secret.");
  }

  const payload = JSON.stringify({ userId, feedType });
  const payloadEncoded = base64UrlEncode(payload);
  const signature = createHmac("sha256", secret).update(payloadEncoded).digest("base64url");

  return `${payloadEncoded}.${signature}`;
}

export function verifyCalendarFeedToken(token: string, expectedFeedType: CalendarFeedType) {
  const secret = getCalendarFeedSecret();

  if (!secret) {
    return null;
  }

  const [payloadEncoded, signature] = token.split(".");

  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as {
      userId?: string;
      feedType?: string;
    };

    if (!payload.userId || payload.feedType !== expectedFeedType) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsDate(dateString: string) {
  return new Date(dateString).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function addDefaultDuration(dateString: string, minutes = 60) {
  return new Date(new Date(dateString).getTime() + minutes * 60_000).toISOString();
}

export function buildCalendarFeed(calendarName: string, events: CalendarEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NAs Tutor Flow//Calendar Feed//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@nastutorflow`);
    lines.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${toIcsDate(event.startsAt)}`);
    lines.push(`DTEND:${toIcsDate(event.endsAt)}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
