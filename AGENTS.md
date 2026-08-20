# Tutor Flow repository guidance

## Product updates

- Before releasing a user-facing production change, add or update a concise entry in `src/lib/product-updates.ts`.
- Keep entries newest first and group closely related changes released on the same day.
- Describe the benefit in tutor-facing language. Do not include commit hashes, internal infrastructure, security-sensitive implementation details, customer information or speculative future features.
- Purely internal maintenance does not need a public update entry.
- Confirm `/updates`, Settings and the sitemap still pass their focused checks before deployment.
