# Tutor Flow repository guidance

## Product updates

- Before releasing a user-facing production change, add or update a concise entry in `src/lib/product-updates.ts`.
- Keep entries newest first and group closely related changes released on the same day.
- Describe the benefit in tutor-facing language. Do not include commit hashes, internal infrastructure, security-sensitive implementation details, customer information or speculative future features.
- Purely internal maintenance does not need a public update entry.
- Confirm `/updates`, Settings and the sitemap still pass their focused checks before deployment.

## Newsletter

- Keep public editions in `NEWSLETTER_ISSUES` in `src/lib/newsletter.ts`, newest first, with a matching public page under `/newsletter`.
- Every edition must offer a useful, original tutoring workflow or example on the page itself; do not publish thin search-targeted posts or invented expertise.
- Give every edition a genuinely new or meaningfully different practical idea rather than repackaging an earlier note.
- Open in Naz's personal, informal voice: warm, conversational and lightly humorous where it feels natural. Avoid corporate introductions and forced jokes.
- Add each edition to the sitemap through the shared newsletter collection and check internal links from relevant resources.
- Keep newsletter subscription separate from Tutor Flow account and student data. Use explicit consent and an unsubscribe route provided by the approved email service. Double opt-in is not required unless the product decision changes.
- Do not add intrusive pop-ups or send newsletters automatically from application account emails.
