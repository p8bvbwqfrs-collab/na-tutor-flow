"use client";

import { useMemo, useState } from "react";

type SummaryLesson = {
  id: string;
  lesson_at: string;
  topics: string;
  topic_tags: string[] | null;
  effort: number;
  confidence: number;
  went_well: string | null;
  improve: string | null;
  homework: string | null;
};

type MonthlySummaryGeneratorProps = {
  studentName: string;
  lessons: SummaryLesson[];
  hideHeader?: boolean;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function cleanSummaryPhrase(value: string) {
  const cleaned = value
    .replace(/^[-•]\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .trim()
    .replace(/[.;,\s]+$/, "")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function splitIntoItems(values: Array<string | null>) {
  return values
    .flatMap((value) => (value ?? "").split(/\n|;/))
    .map(cleanSummaryPhrase)
    .filter(Boolean);
}

function toBulletSection(lines: string[]) {
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join("\n") : "- None yet";
}

function buildSummarySection(title: string, lines: string[]) {
  return `${title}\n${toBulletSection(lines)}`;
}

function uniqueTags(values: Array<string[] | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values
    .flatMap((value) => value ?? [])
    .map(cleanSummaryPhrase)
    .filter(Boolean)
    .forEach((tag) => {
      const key = normaliseKey(tag);

      if (!key || seen.has(key)) {
        return;
      }

      seen.add(key);
      result.push(tag);
    });

  return result;
}

function normaliseKey(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function normaliseWord(word: string) {
  return word.replace(/[^a-z0-9]/gi, "").replace(/(ing|ed|es|s)$/i, "");
}

function getSignatureTokens(value: string) {
  return Array.from(
    new Set(
      normaliseKey(value)
        .split(" ")
        .map(normaliseWord)
        .filter((word) => word.length > 2),
    ),
  );
}

function areNearDuplicate(left: string, right: string) {
  const leftKey = normaliseKey(left);
  const rightKey = normaliseKey(right);

  if (!leftKey || !rightKey) {
    return false;
  }

  if (leftKey === rightKey || leftKey.includes(rightKey) || rightKey.includes(leftKey)) {
    return true;
  }

  const leftTokens = getSignatureTokens(left);
  const rightTokens = getSignatureTokens(right);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return false;
  }

  const overlap = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const threshold = Math.min(leftTokens.length, rightTokens.length);

  return overlap >= Math.max(2, threshold);
}

function dedupeAndLimit(values: string[], limit = 5) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const cleaned = value.trim();
    if (!cleaned) {
      return;
    }

    const key = normaliseKey(cleaned);
    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(cleaned);
  });

  return result.slice(0, limit);
}

function consolidateItems(values: string[], limit = 4) {
  const result: string[] = [];

  values.forEach((value) => {
    const cleaned = value.trim();

    if (!cleaned) {
      return;
    }

    const existingIndex = result.findIndex((item) => areNearDuplicate(item, cleaned));

    if (existingIndex >= 0) {
      if (cleaned.length < result[existingIndex].length) {
        result[existingIndex] = cleaned;
      }
      return;
    }

    result.push(cleaned);
  });

  return result.slice(0, limit);
}

export function MonthlySummaryGenerator({
  studentName,
  lessons,
  hideHeader = false,
}: MonthlySummaryGeneratorProps) {
  const availableMonths = useMemo(() => {
    const months = Array.from(
      new Set(lessons.map((lesson) => getMonthKey(new Date(lesson.lesson_at)))),
    ).sort((a, b) => b.localeCompare(a));

    return months;
  }, [lessons]);

  const monthOptions = useMemo(
    () =>
      availableMonths.map((month) => ({
        value: month,
        label: formatMonthLabel(month),
      })),
    [availableMonths],
  );

  const defaultMonth = useMemo(() => {
    const currentMonth = getMonthKey(new Date());
    if (availableMonths.includes(currentMonth)) {
      return currentMonth;
    }

    return availableMonths[0] ?? currentMonth;
  }, [availableMonths]);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const lessonsForMonth = useMemo(() => {
    return lessons.filter((lesson) => getMonthKey(new Date(lesson.lesson_at)) === selectedMonth);
  }, [lessons, selectedMonth]);

  const summaryInputs = useMemo(() => {
    const topicTags = dedupeAndLimit(uniqueTags(lessonsForMonth.map((lesson) => lesson.topic_tags)), 3);
    const topicsCovered = consolidateItems(splitIntoItems(lessonsForMonth.map((lesson) => lesson.topics)), 3);
    const whatWentWell = consolidateItems(splitIntoItems(lessonsForMonth.map((lesson) => lesson.went_well)), 3);
    const nextFocus = consolidateItems(splitIntoItems(lessonsForMonth.map((lesson) => lesson.improve)), 3);
    const homework = consolidateItems(splitIntoItems(lessonsForMonth.map((lesson) => lesson.homework)), 3);

    return {
      topicTags,
      topicsCovered,
      whatWentWell,
      nextFocus,
      homework,
    };
  }, [lessonsForMonth]);

  function generateSummary() {
    setCopied(false);

    if (lessonsForMonth.length === 0) {
      setSummary("");
      setStatus("No lessons logged for this month yet.");
      return;
    }

    const avgConfidence = (
      lessonsForMonth.reduce((sum, lesson) => sum + lesson.confidence, 0) /
      lessonsForMonth.length
    ).toFixed(1);
    const avgEffort = (
      lessonsForMonth.reduce((sum, lesson) => sum + lesson.effort, 0) /
      lessonsForMonth.length
    ).toFixed(1);

    const topicsSection =
      summaryInputs.topicTags.length > 0 ? summaryInputs.topicTags : summaryInputs.topicsCovered;

    const nextSummary = `${studentName} – Monthly summary for ${formatMonthLabel(selectedMonth)}

This month we focused on:
${toBulletSection(topicsSection)}

Overall
- Lessons completed: ${lessonsForMonth.length}
- Average confidence: ${avgConfidence}/5
- Average effort: ${avgEffort}/5

${buildSummarySection("What’s going well", summaryInputs.whatWentWell)}

${buildSummarySection("Next steps", summaryInputs.nextFocus)}

${buildSummarySection("Homework / follow-up", summaryInputs.homework)}`;

    setSummary(nextSummary);
    setStatus(null);
  }

  async function onCopySummary() {
    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setStatus("Could not copy summary. Please copy it manually.");
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div
        className={`flex flex-col gap-3 ${hideHeader ? "" : "sm:flex-row sm:items-start sm:justify-between"}`}
      >
        {!hideHeader ? (
          <div>
            <h2 className="text-lg font-medium text-zinc-900">Monthly summary</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Generate a parent-ready summary from this student&apos;s lessons.
            </p>
          </div>
        ) : null}
        {availableMonths.length > 0 ? (
          <div
            className={`flex flex-col gap-3 ${
              hideHeader ? "sm:flex-row sm:items-end" : "sm:flex-row sm:items-end sm:justify-end"
            }`}
          >
            <div>
              <label htmlFor="summary_month" className="block text-sm font-medium text-zinc-700">
                Month
              </label>
              <select
                id="summary_month"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setCopied(false);
                  setStatus(null);
                }}
                className="mt-1 min-w-44 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={generateSummary}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Generate summary
            </button>
          </div>
        ) : null}
      </div>

      {availableMonths.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          No lessons logged for this student yet.
        </p>
      ) : null}

      {availableMonths.length > 0 ? (
        <div className="mt-4 space-y-3">
          {status ? (
            <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              {status}
            </p>
          ) : null}

          {summary ? (
            <>
              <textarea
                value={summary}
                onChange={(event) => {
                  setSummary(event.target.value);
                  setCopied(false);
                }}
                rows={16}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onCopySummary}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Copy summary
                </button>
                {copied ? <p className="text-sm font-medium text-emerald-700">Copied.</p> : null}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
              Select a month and generate a summary to review or copy for a parent update.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
