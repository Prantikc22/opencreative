"use client";

type GoalProperties = Record<string, string | number | boolean | null | undefined>;
type DataFastFunction = (
  goal: string,
  properties?: Record<string, string>,
) => void;

declare global {
  interface Window {
    datafast?: DataFastFunction & { q?: unknown[][] };
  }
}

function analyticsAllowed() {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === "oc_cookie_consent=analytics");
}

export function trackDataFastGoal(goal: string, properties?: GoalProperties) {
  if (typeof window === "undefined" || !analyticsAllowed()) return;

  if (!window.datafast) {
    const queued = ((...args: unknown[]) => {
      queued.q = queued.q || [];
      queued.q.push(args);
    }) as DataFastFunction & { q?: unknown[][] };
    window.datafast = queued;
  }

  const sanitized = properties
    ? Object.fromEntries(
        Object.entries(properties)
          .filter(([, value]) => value !== null && value !== undefined)
          .slice(0, 10)
          .map(([key, value]) => [key, String(value).slice(0, 255)]),
      )
    : undefined;
  window.datafast(goal, sanitized);
}
