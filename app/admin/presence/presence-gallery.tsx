"use client";

import { useState } from "react";
import { NextIntlClientProvider, useTranslations } from "next-intl";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import type { ActivityPose } from "@/components/presence/activity-pose";
import {
  DeviceMark,
  FriendsPanel,
  PresenceCard,
} from "@/components/presence/FriendsPanel";
import { PresenceProvider } from "@/components/presence/PresenceProvider";
import type {
  Presence,
  PresenceDevice,
} from "@/components/presence/select-presence";
import { STATUS_DOT } from "@/components/presence/status-style";
import { SilentSounds } from "@/components/sound/SoundProvider";
import {
  TypographyMuted,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { cn } from "@/lib/utils";
import messages from "@/messages/fr.json";

const MINUTE = 60_000;

/** One sample of each card, timed from when the page opened. */
const samples = (now: number): ReadonlyArray<[string, Presence]> => [
  [
    "en jeu",
    {
      kind: "playing",
      name: "League of Legends",
      details: "Ranked Solo/Duo",
      state: "In Game",
      startedAt: now - 23 * MINUTE,
    },
  ],
  [
    "en train de coder, avec le projet",
    {
      kind: "coding",
      editor: "Visual Studio Code",
      language: "TypeScript",
      project: "imjustlucas.dev",
      startedAt: now - 84 * MINUTE,
    },
  ],
  [
    "en train de coder, sans projet",
    {
      kind: "coding",
      editor: "Zed",
      language: "Rust",
      startedAt: now - 12 * MINUTE,
    },
  ],
  [
    "devant une série",
    {
      kind: "watching",
      name: "Crunchyroll",
      details: "Frieren",
      state: "Épisode 12",
      startedAt: now - 9 * MINUTE,
    },
  ],
  [
    "sur Spotify",
    {
      kind: "listening",
      song: "RACAILLE",
      artist: "Ino Casablanca",
      album: "TAMARA",
      artwork: {
        url: "https://i.scdn.co/image/ab67616d0000b2739a7d37fef1f0b9f36808a933",
        alt: "TAMARA",
      },
      url: "https://open.spotify.com/track/48fW6fCNnOvfpBBYwGdRib",
      startedAt: now - 1.5 * MINUTE,
      endsAt: now + 2.5 * MINUTE,
    },
  ],
  ["en ligne, ligne par défaut", { kind: "status", status: "online" }],
  [
    "en ligne, ton message KV",
    {
      kind: "status",
      status: "online",
      message: { text: "en train de finir la v3 du site 🚀" },
    },
  ],
  [
    "en ligne, ton statut Discord",
    {
      kind: "status",
      status: "online",
      message: { text: "shipping the presence card", emoji: "🛠️" },
    },
  ],
  ["absent", { kind: "status", status: "idle" }],
  ["occupé", { kind: "status", status: "dnd" }],
  ["hors ligne", { kind: "status", status: "offline" }],
  [
    "hors ligne, ton message KV",
    {
      kind: "status",
      status: "offline",
      message: { text: "en vacances jusqu'à lundi 🏄" },
    },
  ],
  ["connexion", { kind: "connecting" }],
];

const POSES: ReadonlyArray<[ActivityPose, string]> = [
  ["lol", "en jeu"],
  ["coding", "en train de coder, ou occupé"],
  ["series", "devant une série"],
  ["music", "sur Spotify"],
  ["coffee", "absent"],
  ["sleeping", "hors ligne"],
];

const DEVICES: ReadonlyArray<PresenceDevice> = ["desktop", "mobile", "web"];

/**
 * The presence components of the public client, in French and silent like
 * the rest of the Admin: the live friends panel, every card, the device
 * tags and the live poses.
 */
export function PresenceGallery({ discordUserId }: { discordUserId: string }) {
  return (
    <NextIntlClientProvider
      locale="fr"
      messages={{ Presence: messages.Presence, Layout: messages.Layout }}
      timeZone="Europe/Paris"
    >
      <SilentSounds>
        {/* One Lanyard connection for the live panel and the heads' rings */}
        <PresenceProvider discordUserId={discordUserId}>
          <Gallery />
        </PresenceProvider>
      </SilentSounds>
    </NextIntlClientProvider>
  );
}

function Gallery() {
  const [openedAt] = useState(() => Date.now());

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="En direct"
        note="Le panneau d'amis de la barre latérale, branché sur Lanyard."
      >
        <div className="w-full max-w-[18rem]">
          <FriendsPanel />
        </div>
      </Section>

      <Section
        title="Les cartes"
        note="Chaque état à la largeur de la barre latérale. En direct, les jeux et les éditeurs montrent leurs propres images à la place des carrés vides."
      >
        <ul className="grid gap-x-5 gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))]">
          {samples(openedAt).map(([label, presence]) => (
            <li key={label} className="flex flex-col gap-2">
              <TypographyTag className="px-1 text-ink-muted">
                {label}
              </TypographyTag>
              <div className="tray flex h-[76px] items-center gap-3 overflow-hidden rounded-lg bg-raised p-3">
                <PresenceCard presence={presence} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Les tags"
        note="Le tag « live » du panneau d'amis et le tag de statut de l'écran de contact, avec l'appareil sur lequel tu es."
      >
        <div className="flex flex-wrap gap-3">
          {DEVICES.map((device) => (
            <TypographyTag
              key={device}
              className="flex items-center gap-1 rounded-full bg-online px-2 py-0.5 text-on-bright"
            >
              <DeviceMark device={device} />
              live
            </TypographyTag>
          ))}
          {(["idle", "dnd"] as const).map((status) => (
            <TypographyTag
              key={status}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-on-bright",
                STATUS_DOT[status],
              )}
            >
              <DeviceMark device="mobile" />
              {messages.Presence.status[status]}
            </TypographyTag>
          ))}
        </div>
      </Section>

      <Section
        title="Les poses live"
        note="Le chibi de l'accueil et de l'écran de contact prend la pose de ce que tu fais. En ligne sans activité, il garde la sienne."
      >
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr))]">
          {POSES.map(([pose, label]) => (
            <li
              key={pose}
              className="tray flex flex-col items-center gap-2 rounded-lg bg-raised p-3"
            >
              <span className="relative size-28">
                <span
                  aria-hidden
                  className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
                />
                <PoseSprite pose={pose} />
              </span>
              <TypographyTag className="text-center text-ink-muted">
                {label}
              </TypographyTag>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function PoseSprite({ pose }: { pose: ActivityPose }) {
  const t = useTranslations("Presence");
  return (
    <ChibiSprite
      pose={pose}
      alt={t(`poseAlt.${pose}`)}
      sizes="112px"
      playing={pose === "music"}
      followParisNight
      className="size-full"
    />
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <TypographyTitle as="h2">{title}</TypographyTitle>
        <TypographyMuted className="max-w-[65ch] text-pretty text-label font-normal text-ink-muted">
          {note}
        </TypographyMuted>
      </div>
      {children}
    </section>
  );
}
