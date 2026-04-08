"use client";

type RatingSelectorProps = {
  id: string;
  label: string;
  value: string;
  helperText?: string;
  onChange: (value: string) => void;
};

export function RatingSelector({
  id,
  label,
  value,
  helperText,
  onChange,
}: RatingSelectorProps) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
        <span className="text-sm font-semibold text-zinc-900">{value}/5</span>
      </div>
      <p className="min-h-8 text-xs leading-4 text-zinc-500">
        {helperText ?? "\u00A0"}
      </p>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((option) => {
          const selected = value === String(option);
          return (
            <button
              key={option}
              id={option === 1 ? id : undefined}
              type="button"
              onClick={() => onChange(String(option))}
              aria-pressed={selected}
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                selected
                  ? "border-zinc-700 bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-zinc-300"
                  : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
