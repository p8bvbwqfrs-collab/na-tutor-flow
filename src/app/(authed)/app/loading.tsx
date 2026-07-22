export default function AppLoading() {
  return (
    <section className="mx-auto max-w-md py-10 sm:py-16" aria-labelledby="app-loading-title">
      <div
        className="rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <svg
          className="mx-auto h-5 w-5 animate-spin text-zinc-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z" />
        </svg>
        <h1 id="app-loading-title" className="mt-3 text-base font-medium text-zinc-900">
          Loading your dashboard…
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Getting everything ready.</p>
      </div>
    </section>
  );
}
