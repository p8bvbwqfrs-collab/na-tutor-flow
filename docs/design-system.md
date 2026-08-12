# Tutor Flow design system

Tutor Flow should feel calm, capable and practical. The interface helps an
independent tutor complete their admin quickly; it should never compete with
the work.

## Identity

- Customer-facing name: **Tutor Flow**.
- The NA initials remain part of the domain history, not the product wordmark.
- The flow mark represents a short, connected workflow. Use it with the
  wordmark in navigation and alone for small application icons.
- Do not add generic education imagery such as mortarboards, books or pencils
  to the product identity.

## Foundations

- Primary: blue 700 (#1d4ed8).
- Primary strong: blue 800 (#1e40af).
- Primary soft: blue 50 (#eff6ff).
- Canvas: cool off-white (#f7f8fa).
- Surfaces: white with a zinc 200 boundary.
- Text: zinc 950 for key content, zinc 600 for supporting content.
- Success, warning and danger colours communicate state only; they are not
  decorative accents.
- Controls use an 8px radius. Panels use a 12px radius and a restrained shadow.
- Use the system sans-serif stack and the existing compact type scale.

The canonical CSS values live in src/app/globals.css. Reusable Tailwind
patterns live in src/lib/ui-patterns.ts.

## Core patterns

- Primary action: one per decision area, solid brand blue.
- Secondary action: bordered white surface.
- Quiet action: navigation and low-emphasis utilities.
- Form control: labelled, full-width on mobile, visible border and focus ring.
- Surface panel: grouped content with one boundary; avoid nesting several
  competing boxes.
- Section heading: concise title with optional, touch- and keyboard-accessible
  supporting information.

## Layout and responsive rules

- Start at 320px and enhance progressively.
- Use full-width primary controls on narrow screens when actions would
  otherwise wrap awkwardly.
- Keep related actions together and allow text to wrap before controls become
  compressed.
- Prefer one clear content column on mobile and introduce columns only when
  their relationship is easier to understand side by side.
- Keep public and authenticated shells aligned to the same maximum content
  width.

## Accessibility

- Interactive targets are at least 40px tall; primary conversion actions are
  at least 44px.
- Every interaction works with touch and keyboard. Information cannot depend
  on hover.
- Use one visible h1, followed by ordered section headings.
- Preserve explicit labels, status announcements and error focus.
- Never use colour as the only status signal.
- Maintain the shared blue focus ring on every interactive element.

## Content

- Lead with the tutor's next task or outcome.
- Keep explanations optional when they interrupt scanning.
- Use “Tutor Flow” consistently.
- Do not invent testimonials, scale claims or guarantees.
- Do not expose student, parent, lesson or payment data in analytics.
