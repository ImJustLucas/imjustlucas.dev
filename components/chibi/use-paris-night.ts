"use client";

import { useEffect, useState } from "react";

import { isNightInParis } from "@/lib/paris-time";

/**
 * Whether it is night for Lucas in Paris. Pages are static, so the server
 * and the first render say day; the client switches after mount and checks
 * again every minute.
 */
export const useParisNight = () => {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const check = () => setNight(isNightInParis(new Date()));
    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return night;
};
