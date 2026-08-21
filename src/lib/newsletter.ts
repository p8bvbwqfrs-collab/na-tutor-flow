export type NewsletterIssue = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
};

export const NEWSLETTER_NAME = "Tutor Flow Notes";

export const NEWSLETTER_ISSUES = [
  {
    slug: "five-minute-after-lesson-routine",
    title: "A five-minute routine after every tutoring lesson",
    description:
      "A practical way to finish your notes, parent update, payment check and next-lesson planning while the session is still fresh.",
    publishedAt: "2026-08-21",
    readTime: "4 min read",
  },
] as const satisfies readonly NewsletterIssue[];

export const LATEST_NEWSLETTER_DATE = NEWSLETTER_ISSUES[0].publishedAt;

export function getNewsletterIssue(slug: string) {
  return NEWSLETTER_ISSUES.find((issue) => issue.slug === slug);
}
