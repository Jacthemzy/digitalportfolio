"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "tj_visitor_id";

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getFingerprint(): string {
  try {
    return btoa([
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join("|")).slice(0, 32);
  } catch { return "unknown"; }
}

export function useVisitorTracker() {
  const pathname = usePathname();
  const pageStartTime = useRef(Date.now());
  const visitorId = useRef<string>("");

  useEffect(() => {
    visitorId.current = getOrCreateVisitorId();
  }, []);

  // Track page view on route change
  useEffect(() => {
    if (!visitorId.current) return;
    const vid = visitorId.current;
    const startTime = Date.now();
    pageStartTime.current = startTime;

    // Track pageview
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: vid,
        event: "pageview",
        page: pathname,
        fingerprint: getFingerprint(),
      }),
    }).catch(() => {});

    // Track time spent when leaving page
    const handleUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      navigator.sendBeacon("/api/track", JSON.stringify({
        visitorId: vid,
        event: "timespent",
        page: pathname,
        timeSpent,
      }));
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // Also track when navigating away (SPA)
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: vid,
          event: "timespent",
          page: pathname,
          timeSpent,
        }),
      }).catch(() => {});
    };
  }, [pathname]);

  // Track clicks
  useEffect(() => {
    if (!visitorId.current) return;
    const vid = visitorId.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element =
        target.closest("a")?.getAttribute("href") ||
        target.closest("button")?.textContent?.trim().slice(0, 50) ||
        target.getAttribute("data-track") ||
        target.tagName.toLowerCase();

      if (!element || element === "div" || element === "span") return;

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: vid,
          event: "click",
          page: pathname,
          element,
        }),
      }).catch(() => {});
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);
}

// Export visitorId getter for use in chat
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(VISITOR_KEY) || "";
}
