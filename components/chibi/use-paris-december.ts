"use client";

import { useEffect, useState } from "react";

import { isDecemberInParis } from "@/lib/paris-time";

/**
 * Whether it is December for Lucas in Paris. Pages are static, so the server
 * and the first render say no; the client checks after mount.
 */
export const useParisDecember = () => {
  const [december, setDecember] = useState(false);
  useEffect(() => {
    const check = () => setDecember(isDecemberInParis(new Date()));
    check();
  }, []);
  return december;
};
