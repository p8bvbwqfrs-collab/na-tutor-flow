const APP_LOCALE = "en-GB";
const APP_TIME_ZONE = "Europe/London";

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

export { APP_LOCALE, APP_TIME_ZONE };
