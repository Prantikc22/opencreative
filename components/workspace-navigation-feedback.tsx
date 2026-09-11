"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const NAVIGATION_TIMEOUT = 8_000;

export function WorkspaceNavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const search = searchParams.toString();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPending(false));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>(".app-shell a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash === window.location.hash
      ) return;

      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), NAVIGATION_TIMEOUT);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={cn("workspace-navigation-feedback", pending && "is-active")}
      role="status"
      aria-live="polite"
      aria-label={pending ? "Opening page" : undefined}
    >
      <span aria-hidden="true" />
      <div className="workspace-navigation-toast" aria-hidden="true">
        <i />
        <span>Opening</span>
      </div>
    </div>
  );
}
