"use client";

import Link from "next/link";
import { LessonUpdateActions } from "@/components/lesson-update-actions";

type LessonSuccessPanelProps = {
  title: string;
  description: string;
  updateMessage?: string;
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  tertiaryAction?: {
    label: string;
    href: string;
  };
  warning?: string | null;
  error?: string | null;
};

const actionButtonClassName =
  "inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-4 py-0 text-sm font-medium leading-none text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto";
const actionItemClassName = "flex w-full items-center sm:w-auto";

export function LessonSuccessPanel({
  title,
  description,
  updateMessage,
  secondaryAction,
  tertiaryAction,
  warning,
  error,
}: LessonSuccessPanelProps) {
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p role="status" className="text-base font-semibold text-emerald-900">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-emerald-900/80">{description}</p>
        {updateMessage || secondaryAction || tertiaryAction ? (
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            {updateMessage ? (
              <LessonUpdateActions
                message={updateMessage}
                className={actionItemClassName}
                reserveFeedbackSpace={false}
                buttonClassName={actionButtonClassName}
              />
            ) : null}
            {secondaryAction?.href ? (
              <div className={actionItemClassName}>
                <Link href={secondaryAction.href} className={actionButtonClassName}>
                  {secondaryAction.label}
                </Link>
              </div>
            ) : null}
            {secondaryAction?.onClick ? (
              <div className={actionItemClassName}>
                <button type="button" onClick={secondaryAction.onClick} className={actionButtonClassName}>
                  {secondaryAction.label}
                </button>
              </div>
            ) : null}
            {tertiaryAction ? (
              <div className={actionItemClassName}>
                <Link href={tertiaryAction.href} className={actionButtonClassName}>
                  {tertiaryAction.label}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        {warning || error ? (
          <div className="mt-2 min-h-5">
            {warning ? <p className="text-sm text-amber-800">{warning}</p> : null}
            {!warning && error ? <p className="text-sm text-rose-800">{error}</p> : null}
          </div>
        ) : null}
      </div>

      {updateMessage ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-medium text-zinc-700">Update message</h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            {updateMessage}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
