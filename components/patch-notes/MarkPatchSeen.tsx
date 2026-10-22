"use client";

import { useEffect } from "react";

import { markPatchSeen } from "./patch-seen";

/** Opening the patch notes reads the current version: the sidebar's dot goes. */
export function MarkPatchSeen({ version }: { version: string }) {
  useEffect(() => markPatchSeen(version), [version]);
  return null;
}
