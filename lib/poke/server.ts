import { Effect, Layer } from "effect";

import { SITE_URL } from "@/config/site";
import { getProjectSlugs } from "@/lib/content/server";
import { upstashConfigured } from "@/lib/upstash";

import { knownPaths, type PokePlace } from "./message";
import {
  PokeNotifier,
  pokeReply,
  PokeStore,
  PokeUnavailable,
  recentPokes,
  sendPoke,
  waveBack,
} from "./poke";
import { layerNotifierDiscord, pokeWebhookUrl } from "./poke-discord";
import { layerStoreUpstash } from "./poke-upstash";
import type { PokeReply, RecentPoke, SentPoke } from "./result";
import { visitorKey } from "./visitor";

import "server-only";

/**
 * Entry point for the Pokes' Server Actions and the Admin, and the only
 * place their Effect code runs: against Upstash and Lucas's Discord webhook.
 * It returns plain data (ADR-0002); when either cannot be reached, nothing
 * is sent and the button says so calmly.
 */

/** Whether visitors can wave: the webhook and the store are both set. */
export const pokeEnabled = () =>
  Boolean(pokeWebhookUrl()) && upstashConfigured();

const LIVE = Layer.merge(layerStoreUpstash, layerNotifierDiscord);

const run = <A, B>(
  effect: Effect.Effect<A, PokeUnavailable, PokeStore | PokeNotifier>,
  unavailable: B,
): Promise<A | B> =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(LIVE),
      Effect.catchTag("PokeUnavailable", (error) =>
        Effect.sync(() => {
          console.error("Poke unavailable:", error.message);
          return unavailable;
        }),
      ),
    ),
  );

const UNAVAILABLE = { kind: "unavailable" } as const;

/** The Admin's row of a Poke, where Lucas waves back. */
const waveBackUrl = (id: string) =>
  new URL(`/admin/pokes#poke-${id}`, SITE_URL).toString();

/** Sends the Poke `input` of the visitor at `address` (an IP address). */
export const sendVisitorPoke = async (
  input: unknown,
  address: string,
  place: PokePlace | null,
): Promise<SentPoke> => {
  const secret = pokeWebhookUrl();
  if (!secret || !upstashConfigured()) return UNAVAILABLE;
  const known = knownPaths(await getProjectSlugs());
  return run(
    sendPoke(input, {
      visitor: visitorKey(address, secret),
      known,
      place,
      waveBackUrl,
    }),
    UNAVAILABLE,
  );
};

/** Whether Lucas waved back at the visitor's Poke. */
export const getPokeReply = (id: unknown): Promise<PokeReply> =>
  run(pokeReply(id), UNAVAILABLE);

/** The last week's Pokes, newest first, or unavailable. */
export const getRecentPokes = (): Promise<
  | { readonly kind: "pokes"; readonly pokes: ReadonlyArray<RecentPoke> }
  | typeof UNAVAILABLE
> =>
  run(
    Effect.map(recentPokes, (pokes) => ({ kind: "pokes", pokes }) as const),
    UNAVAILABLE,
  );

/** Lucas waves back at a Poke; the caller checks the Owner. */
export const waveBackPoke = (id: string) => run(waveBack(id), UNAVAILABLE);
