"use client";

import { useEffect, useMemo, useState } from "react";
import { getCompletedLessonUpdateStorageKey } from "@/lib/lesson-completion";
import { LessonSuccessPanel } from "./lesson-success-panel";

type CompletedLessonUpdateBannerProps = {
  studentId: string;
};

export function CompletedLessonUpdateBanner({
  studentId,
}: CompletedLessonUpdateBannerProps) {
  const storageKey = useMemo(() => getCompletedLessonUpdateStorageKey(studentId), [studentId]);
  const [parentUpdate, setParentUpdate] = useState<string | null>(null);

  useEffect(() => {
    const savedUpdate = window.sessionStorage.getItem(storageKey);
    if (savedUpdate) {
      setParentUpdate(savedUpdate);
    }
  }, [storageKey]);

  function onDismiss() {
    window.sessionStorage.removeItem(storageKey);
    setParentUpdate(null);
  }

  if (!parentUpdate) {
    return null;
  }

  return (
    <div className="mt-4">
      <LessonSuccessPanel
        title="Lesson completed"
        description="The lesson is now saved on the student page. Share the update message from here."
        updateMessage={parentUpdate}
        secondaryAction={{
          label: "Dismiss",
          onClick: onDismiss,
        }}
      />
    </div>
  );
}
