"use client";

import { track } from "@vercel/analytics";

export type ActivationStep =
  | "signup_submitted"
  | "student_added"
  | "lesson_logged"
  | "parent_update_shared"
  | "payment_recorded"
  | "payment_reminder_shared";

export function trackActivationStep(step: ActivationStep) {
  try {
    // Deliberately send only a fixed workflow label. Never attach tutor,
    // student, contact, lesson, payment or free-text data to this event.
    track("activation_step", { step });
  } catch {
    // Product actions must continue normally when analytics is unavailable.
  }
}
