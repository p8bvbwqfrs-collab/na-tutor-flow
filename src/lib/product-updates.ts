export type ProductUpdate = {
  date: string;
  title: string;
  summary: string;
  changes: readonly string[];
};

export const PRODUCT_UPDATES = [
  {
    date: "2026-09-01",
    title: "Clearer free tutor templates",
    summary:
      "The free payment and parent-update templates are now easier to understand and use straight away.",
    changes: [
      "Made the free CSV download and its Excel and Google Sheets compatibility clearer.",
      "Added a short setup guide for recording lessons, payments, outstanding balances and prepaid credit.",
      "Confirmed that downloading the template does not require an email address or Tutor Flow account.",
      "Added a copy-and-paste parent update for WhatsApp or email alongside a realistic lesson example.",
      "Clarified when a short lesson update is more useful than a broader progress report.",
    ],
  },
  {
    date: "2026-08-24",
    title: "A clearer newsletter choice",
    summary:
      "Tutors can now choose whether to join Tutor Flow Notes without linking newsletter consent to their account.",
    changes: [
      "Added an optional route to the separate newsletter signup when creating a Tutor Flow account.",
      "Added a clear newsletter link in Settings while keeping account email addresses unsubscribed by default.",
      "Kept signup simple with one explicit consent step and an unsubscribe link in every email.",
    ],
  },
  {
    date: "2026-08-21",
    title: "Practical notes for independent tutors",
    summary:
      "Tutor Flow Notes brings short, useful tutoring-workflow ideas together in a free public archive.",
    changes: [
      "Added a newsletter archive with a practical first edition on the five-minute after-lesson routine.",
      "Made each edition free to read and easy to find from Resources and the site footer.",
      "Prepared a separate, consent-led email signup without using tutoring or account data.",
      "Added a dismissible invitation for signed-in tutors who choose to join the monthly notes.",
    ],
  },
  {
    date: "2026-08-20",
    title: "A clearer maths tuition profile",
    summary:
      "Families can now understand the tuition approach, course fit and next step more quickly.",
    changes: [
      "Refined the maths tutoring page around verified experience, lesson approach and parent feedback.",
      "Made course choices, pricing, common questions and the enquiry route easier to scan on mobile.",
    ],
  },
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
