"use server";

import { refresh } from "next/cache";

import { field, type FormState } from "@/app/admin/action-form";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { currentOwnerAccess } from "@/lib/admin/session";
import { waveBackPoke } from "@/lib/poke/server";

/**
 * Lucas waves back at a Poke: the visitor sees it on their next visit.
 * Nothing is committed: Pokes live in Upstash, not in the content.
 */
export async function waveBackAction(
  _: FormState,
  form: FormData,
): Promise<AdminActionResult> {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return { kind: "not-owner" };
  const result = await waveBackPoke(field(form, "pokeId"));
  if (result.kind === "unavailable") {
    return {
      kind: "failed",
      reason: "Upstash ne répond pas, réessaie dans un instant.",
    };
  }
  if (result.kind === "gone") {
    return {
      kind: "failed",
      reason: "Ce coucou a plus d'une semaine : il n'est plus gardé.",
    };
  }
  refresh();
  return { kind: "saved", revision: "" };
}
