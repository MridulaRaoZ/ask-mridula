"use client";

import { useEffect } from "react";

// Sends one anonymous visit beacon per page load (no cookies).
export default function VisitTracker() {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
