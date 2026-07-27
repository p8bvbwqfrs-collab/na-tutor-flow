const APP_LOCALE = "en-GB";
const APP_TIME_ZONE = "Europe/London";

const londonInputFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function createFormatter(options: Intl.DateTimeFormatOptions, locale = APP_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: APP_TIME_ZONE,
  });
}

const dateTimeFormatter = createFormatter({
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = createFormatter({
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = createFormatter({
  day: "2-digit",
  month: "short",
});

const dayHeadingFormatter = createFormatter({
  weekday: "short",
  day: "numeric",
  month: "long",
});

const dayNumberFormatter = createFormatter({
  day: "numeric",
});

const timeFormatter = createFormatter({
  hour: "numeric",
  minute: "2-digit",
});

const monthFormatter = createFormatter({
  month: "long",
  year: "numeric",
});

const monthShortFormatter = createFormatter({
  month: "short",
});

const weekdayShortFormatter = createFormatter({
  weekday: "short",
});

const dateKeyFormatter = createFormatter(
  {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  "en-CA",
);

const monthKeyFormatter = createFormatter(
  {
    year: "numeric",
    month: "2-digit",
  },
  "en-CA",
);

export function formatDateTimeLocal(value: string | Date) {
  return dateTimeFormatter.format(toDate(value));
}

export function formatDateLocal(value: string | Date) {
  return dateFormatter.format(toDate(value));
}

export function formatShortDateLocal(value: string | Date) {
  return shortDateFormatter.format(toDate(value));
}

export function formatDayHeadingLocal(value: string | Date) {
  return dayHeadingFormatter.format(toDate(value));
}

export function formatDayNumberLocal(value: string | Date) {
  return dayNumberFormatter.format(toDate(value));
}

export function formatTimeLocal(value: string | Date) {
  return timeFormatter.format(toDate(value));
}

export function formatMonthLocal(value: string | Date) {
  return monthFormatter.format(toDate(value));
}

export function formatMonthShortLocal(value: string | Date) {
  return monthShortFormatter.format(toDate(value));
}

export function formatWeekdayShortLocal(value: string | Date) {
  return weekdayShortFormatter.format(toDate(value));
}

export function getDateKeyLocal(value: string | Date) {
  return dateKeyFormatter.format(toDate(value));
}

export function getMonthKeyLocal(value: string | Date) {
  return monthKeyFormatter.format(toDate(value));
}

function getLondonDateTimeParts(value: string | Date) {
  const parts = londonInputFormatter.formatToParts(toDate(value));
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  const year = partValue("year");
  const month = partValue("month");
  const day = partValue("day");
  const hour = partValue("hour");
  const minute = partValue("minute");
  const second = partValue("second");

  if (!year || !month || !day || !hour || !minute || !second) {
    throw new Error("Unable to resolve Europe/London date and time.");
  }

  return { year, month, day, hour, minute, second };
}

export function getLondonDateTimeInputValues(value: string | Date) {
  const { year, month, day, hour, minute } = getLondonDateTimeParts(value);

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

export function londonDateTimeToIso(dateValue: string, timeValue: string) {
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

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error("Lesson date and time is invalid.");
  }

  const londonWallClockUtc = Date.UTC(year, month - 1, day, hour, minute);
  let resolvedUtc = londonWallClockUtc;

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = getLondonDateTimeParts(new Date(resolvedUtc));
    const representedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    resolvedUtc = londonWallClockUtc - (representedAsUtc - resolvedUtc);
  }

  const resolved = new Date(resolvedUtc);
  const roundTrip = getLondonDateTimeInputValues(resolved);

  if (roundTrip.date !== dateValue || roundTrip.time !== timeValue) {
    throw new Error("Lesson date and time does not exist in Europe/London.");
  }

  return resolved.toISOString();
}

export { APP_LOCALE, APP_TIME_ZONE };
