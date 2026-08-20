export type ProductUpdate = {
  date: string;
  title: string;
  summary: string;
  changes: readonly string[];
};

export const PRODUCT_UPDATES = [
  {
    date: "2026-08-20",
    title: "Share Tutor Flow more easily",
    summary:
      "Early adopters can now introduce Tutor Flow to another independent tutor without leaving Settings.",
    changes: [
      "Added an editable referral message with native sharing and a copy fallback.",
      "Kept sharing completely tutor controlled—nothing is sent automatically and no recipient details are collected.",
      "Added this public product-updates page so meaningful improvements remain easy to find.",
    ],
  },
  {
    date: "2026-08-18",
    title: "Clearer payments and safer sessions",
    summary:
      "Payment follow-up is easier to act on, while signed-in sessions now have a clear security limit.",
    changes: [
      "Made it simpler to record payment for a specific lesson from the student page.",
      "Prioritised unpaid lessons and payment follow-up on the dashboard.",
      "Added an eight-hour maximum signed-in session before a fresh login is required.",
    ],
  },
  {
    date: "2026-08-12",
    title: "More dependable everyday workflows",
    summary:
      "A group of refinements made common mobile, reporting and feedback tasks clearer and more reliable.",
    changes: [
      "Prevented rapid repeated form submissions from creating duplicate records.",
      "Clarified mobile student and lesson actions, reporting filters and signed-in navigation.",
      "Added a direct early-adopter feedback route and clearer public information about data use and future pricing.",
    ],
  },
] as const satisfies readonly ProductUpdate[];

export const LATEST_PRODUCT_UPDATE_DATE = PRODUCT_UPDATES[0].date;
