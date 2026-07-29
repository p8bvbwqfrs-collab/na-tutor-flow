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
  const helperId = `${id}-help`;

  return (
    <fieldset className="min-w-0 space-y-2" aria-describedby={helperId}>
      <legend className="w-full text-sm font-medium text-zinc-700">
        <span className="flex items-center justify-between gap-3">
          <span>{label}</span>
          <span aria-hidden="true" className="text-sm font-semibold text-zinc-900">
            {value}/5
          </span>
        </span>
      </legend>
      <p id={helperId} className="min-h-8 text-xs leading-4 text-zinc-500">
        {helperText ?? "\u00A0"}
      </p>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((option) => {
          const selected = value === String(option);
          return (
            <span key={option} className="relative shrink-0">
              <input
                id={`${id}-${option}`}
                name={id}
                type="radio"
                value={option}
                checked={selected}
                onChange={(event) => onChange(event.target.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={`${id}-${option}`}
                className={`inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 ${
                  selected
                    ? "border-zinc-700 bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-zinc-300"
                    : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <span aria-hidden="true">{option}</span>
                <span className="sr-only">{option} out of 5</span>
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}
