"use server";

import { headers } from "next/headers";

import { pokePlace } from "@/lib/poke/message";
import type { PokeReply, SentPoke } from "@/lib/poke/result";
import { getPokeReply, sendVisitorPoke } from "@/lib/poke/server";
import { clientAddress } from "@/lib/poke/visitor";

/**
 * The Pokes' Server Actions: public endpoints, so every input is checked by
 * `lib/poke/poke.ts` and each visitor is limited by a keyed hash of their
 * IP address. Next refuses a Server Action whose Origin is not the site's.
 */

export async function sendPokeAction(input: unknown): Promise<SentPoke> {
  const request = await headers();
  return sendVisitorPoke(
    input,
    clientAddress(request.get("x-forwarded-for")),
    pokePlace(
      request.get("x-vercel-ip-city"),
      request.get("x-vercel-ip-country"),
    ),
  );
}

export async function pokeReplyAction(pokeId: unknown): Promise<PokeReply> {
  return getPokeReply(pokeId);
}
