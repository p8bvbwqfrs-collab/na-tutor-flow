"use client";

import { useEffect } from "react";
import { readAppSessionDeadline } from "@/lib/session-timeout";

export function SessionTimeoutGuard() {
  useEffect(() => {
    const deadline = readAppSessionDeadline(document.cookie);

    if (!deadline) {
      window.location.replace("/app/dashboard");
      return;
    }

    const timeoutId = window.setTimeout(
      () => window.location.replace("/app/dashboard"),
      Math.max(0, deadline - Date.now()),
    );

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
