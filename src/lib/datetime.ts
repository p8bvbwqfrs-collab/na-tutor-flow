const APP_LOCALE = "en-GB";
const DEFAULT_TIME_ZONE = "Europe/London";
const APP_TIME_ZONE = DEFAULT_TIME_ZONE;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function isPlainDate(value: string | Date): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPlainMonth(value: string | Date): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value);
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function getFormatter(
  options: Intl.DateTimeFormatOptions,
  locale = APP_LOCALE,
  timeZone = DEFAULT_TIME_ZONE,
) {
  const key = JSON.stringify([locale, timeZone, options]);
  const cached = formatterCache.get(key);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone });
  formatterCache.set(key, formatter);
  return formatter;
}

function formatPlainCalendarValue(
  value: string,
  options: Intl.DateTimeFormatOptions,
  locale = APP_LOCALE,
) {
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  return getFormatter(options, locale, "UTC").format(new Date(`${normalized}T12:00:00.000Z`));
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export const COMMON_TIME_ZONES = [
  { value: "Europe/London", label: "United Kingdom — London" },
  { value: "Europe/Dublin", label: "Ireland — Dublin" },
  { value: "Europe/Paris", label: "Central Europe — Paris" },
  { value: "Europe/Athens", label: "Eastern Europe — Athens" },
  { value: "America/New_York", label: "US & Canada — Eastern" },
  { value: "America/Chicago", label: "US & Canada — Central" },
  { value: "America/Denver", label: "US & Canada — Mountain" },
  { value: "America/Los_Angeles", label: "US & Canada — Pacific" },
  { value: "America/Phoenix", label: "US — Arizona" },
  { value: "America/Anchorage", label: "US — Alaska" },
  { value: "Pacific/Honolulu", label: "US — Hawaii" },
  { value: "Asia/Dubai", label: "United Arab Emirates — Dubai" },
  { value: "Asia/Kolkata", label: "India — Kolkata" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Australia/Perth", label: "Australia — Perth" },
  { value: "Australia/Sydney", label: "Australia — Sydney" },
  { value: "Pacific/Auckland", label: "New Zealand — Auckland" },
] as const;

export function getTimeZoneLabel(timeZone: string) {
  return COMMON_TIME_ZONES.find((option) => option.value === timeZone)?.label ?? timeZone;
}

export function formatDateTimeLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  return getFormatter({ dateStyle: "medium", timeStyle: "short" }, APP_LOCALE, timeZone).format(
    toDate(value),
  );
}

export function formatDateLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatShortDateLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatDayHeadingLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "long" };
  return isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatDayNumberLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric" };
  return isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatTimeLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  return getFormatter(
    { hour: "numeric", minute: "2-digit" },
    APP_LOCALE,
    timeZone,
  ).format(toDate(value));
}

export function formatMonthLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  return isPlainMonth(value) || isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatMonthShortLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { month: "short" };
  return isPlainMonth(value) || isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function formatWeekdayShortLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  const options: Intl.DateTimeFormatOptions = { weekday: "short" };
  return isPlainDate(value)
    ? formatPlainCalendarValue(value, options)
    : getFormatter(options, APP_LOCALE, timeZone).format(toDate(value));
}

export function getDateKeyLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  if (isPlainDate(value)) {
    return value;
  }

  return getFormatter(
    { year: "numeric", month: "2-digit", day: "2-digit" },
    "en-CA",
    timeZone,
  ).format(toDate(value));
}

export function getMonthKeyLocal(value: string | Date, timeZone = DEFAULT_TIME_ZONE) {
  if (isPlainMonth(value)) {
    return value;
  }

  if (isPlainDate(value)) {
    return value.slice(0, 7);
  }

  return getFormatter({ year: "numeric", month: "2-digit" }, "en-CA", timeZone).format(
    toDate(value),
  );
}

function getZonedDateTimeParts(value: string | Date, timeZone: string) {
  const parts = getFormatter(
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    },
    "en-GB",
    timeZone,
  ).formatToParts(toDate(value));
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = partValue("year");
  const month = partValue("month");
  const day = partValue("day");
  const hour = partValue("hour");
  const minute = partValue("minute");
  const second = partValue("second");

  if (!year || !month || !day || !hour || !minute || !second) {
    throw new Error(`Unable to resolve date and time in ${timeZone}.`);
  }

  return { year, month, day, hour, minute, second };
}

export function getZonedDateTimeInputValues(
  value: string | Date,
  timeZone = DEFAULT_TIME_ZONE,
) {
  const { year, month, day, hour, minute } = getZonedDateTimeParts(value, timeZone);
  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` };
}

function parseWallClock(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);

  if (!dateMatch || !timeMatch) {
    throw new Error("Lesson date and time is invalid.");
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const calendarCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    throw new Error("Lesson date and time is invalid.");
  }

  return { year, month, day, hour, minute };
}

export function zonedDateTimeToIso(
  dateValue: string,
  timeValue: string,
  timeZone = DEFAULT_TIME_ZONE,
) {
  if (!isValidTimeZone(timeZone)) {
    throw new Error("Time zone is invalid.");
  }

  const { year, month, day, hour, minute } = parseWallClock(dateValue, timeValue);
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute);
  let resolvedUtc = wallClockUtc;

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const parts = getZonedDateTimeParts(new Date(resolvedUtc), timeZone);
    const representedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    resolvedUtc -= representedAsUtc - wallClockUtc;
  }

  const matchingInstants: number[] = [];
  for (let candidate = resolvedUtc - 3 * 60 * 60_000; candidate <= resolvedUtc + 3 * 60 * 60_000; candidate += 60_000) {
    const roundTrip = getZonedDateTimeInputValues(new Date(candidate), timeZone);
    if (roundTrip.date === dateValue && roundTrip.time === timeValue) {
      matchingInstants.push(candidate);
    }
  }

  if (matchingInstants.length === 0) {
    throw new Error(`Lesson date and time does not exist in ${timeZone}.`);
  }

  // During the autumn clock change a wall-clock time can occur twice. Choose
  // the first occurrence consistently rather than depending on the device zone.
  return new Date(Math.min(...matchingInstants)).toISOString();
}

export function getMonthBoundsIso(monthKey: string, timeZone = DEFAULT_TIME_ZONE) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) {
    throw new Error("Month is invalid.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error("Month is invalid.");
  }

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    startIso: zonedDateTimeToIso(`${year}-${String(month).padStart(2, "0")}-01`, "00:00", timeZone),
    endIso: zonedDateTimeToIso(
      `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
      "00:00",
      timeZone,
    ),
  };
}

export function getLondonDateTimeInputValues(value: string | Date) {
  return getZonedDateTimeInputValues(value, DEFAULT_TIME_ZONE);
}

export function londonDateTimeToIso(dateValue: string, timeValue: string) {
  return zonedDateTimeToIso(dateValue, timeValue, DEFAULT_TIME_ZONE);
}

export { APP_LOCALE, APP_TIME_ZONE, DEFAULT_TIME_ZONE };
