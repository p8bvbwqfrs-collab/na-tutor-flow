"use client";

import { useState } from "react";

const exampleSections = [
  {
    heading: "Today we worked on",
    items: ["Fractions with different denominators", "Multi-step word problems"],
  },
  {
    heading: "Strong work on",
    items: ["Explaining her method more clearly", "Checking answers before moving on"],
  },
  {
    heading: "Next focus",
    items: ["Slowing down on the final step of longer questions"],
  },
  {
    heading: "Homework",
    items: ["Complete questions 4-8 from the worksheet", "Review fraction shortcuts before next lesson"],
  },
] as const;

export function ParentUpdatePreview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="text-sm font-medium text-zinc-900 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {isOpen ? "▼ Hide example" : "▶ See example update"}
      </button>

      {isOpen ? (
        <div className="mt-4">
          <div className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-slate-50 p-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800">
              <p className="font-medium text-zinc-900">Ava Johnson – lesson update (07 Apr)</p>

              <p className="mt-4">
                Ava stayed positive today and was much quicker to settle into the harder questions.
              </p>

              <div className="mt-5 space-y-5">
                {exampleSections.map((section) => (
                  <div key={section.heading}>
                    <p className="font-medium text-zinc-900">{section.heading}</p>
                    <ul className="mt-2 space-y-1.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-zinc-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-1 text-zinc-700">
                <p>Effort: 4/5</p>
                <p>Confidence: 4/5</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Takes ~30–60 seconds to create after each lesson
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
