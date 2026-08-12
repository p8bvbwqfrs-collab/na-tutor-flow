export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

export const primaryAction =
  `inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 ${focusRing}`;

export const secondaryAction =
  `inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 ${focusRing}`;

export const quietAction =
  `inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 ${focusRing}`;

export const fieldControl =
  `w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 shadow-sm placeholder:text-zinc-500 transition focus:border-blue-600 ${focusRing}`;

export const surfacePanel =
  "rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-panel)]";

export const sectionEyebrow =
  "text-xs font-semibold uppercase tracking-[0.14em] text-blue-700";
