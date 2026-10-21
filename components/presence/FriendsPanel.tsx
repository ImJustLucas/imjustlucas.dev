"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ChibiHead } from "@/components/chibi/ChibiHead";
import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { TypographyData, TypographyTag } from "@/components/typography";
import { cn } from "@/lib/utils";

import { formatElapsed } from "./format-elapsed";
import { presenceActivity } from "./presence-activity";
import { usePresence } from "./PresenceProvider";
import type { Presence } from "./select-presence";
import { STATUS_DOT } from "./status-style";

/**
 * The friends panel: Lucas's live Discord presence, always shown, in a slot
 * of fixed height so the sidebar never jumps between states.
 */
export function FriendsPanel() {
  const { presence, status } = usePresence();
  const t = useTranslations("Presence");
  const live = status !== "connecting" && status !== "offline";

  return (
    <section aria-labelledby="friends-title" className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span id="friends-title" className="text-label text-ink-muted">
          {t("title")}
        </span>
        {live && (
          <TypographyTag className="rounded-full bg-online px-2 py-0.5 text-on-bright">
            {t("live")}
          </TypographyTag>
        )}
      </div>
      <div className="tray flex h-[76px] items-center gap-3 overflow-hidden rounded-lg bg-raised p-3">
        <PresenceCard presence={presence} />
      </div>
      <PresenceAnnouncer presence={presence} />
    </section>
  );
}

/** How long a new activity must hold before it is announced. */
const SETTLE_MS = 2000;

/**
 * Says aloud, politely, when Lucas starts or stops a game, starts listening
 * or changes status, once the change has held for a moment. The first state
 * after connecting is not announced, nor the elapsed time or the track.
 */
function PresenceAnnouncer({ presence }: { presence: Presence }) {
  const t = useTranslations("Presence");
  const [message, setMessage] = useState("");
  const announced = useRef<string | null>(null);
  const activity = presenceActivity(presence);
  const text = (() => {
    switch (presence.kind) {
      case "playing":
        return t("announce.playing", { name: presence.name });
      case "listening":
        return t("announce.listening", {
          song: presence.song,
          artist: presence.artist,
        });
      case "status":
        return t("announce.status", { status: t(`status.${presence.status}`) });
      case "connecting":
        return "";
    }
  })();

  useEffect(() => {
    if (activity === null || activity === announced.current) return;
    if (announced.current === null) {
      announced.current = activity;
      return;
    }
    const timer = window.setTimeout(() => {
      announced.current = activity;
      setMessage(text);
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [activity, text]);

  return (
    <span role="status" className="sr-only">
      {message}
    </span>
  );
}

/** What Lucas is doing right now, as the row inside a presence slot. */
export function PresenceCard({ presence }: { presence: Presence }) {
  switch (presence.kind) {
    case "playing":
      return <Playing presence={presence} />;
    case "listening":
      return <Listening presence={presence} />;
    case "status":
      return <Status status={presence.status} />;
    case "connecting":
      return <Connecting />;
  }
}

/** One line that truncates, with the full text on hover. */
function Line({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span title={children} className={cn("block truncate", className)}>
      {children}
    </span>
  );
}

function Artwork({
  artwork,
  badge,
}: {
  artwork?: { url: string; alt: string };
  badge?: { url: string; alt: string; dark?: boolean };
}) {
  return (
    <span className="relative size-12 shrink-0">
      {artwork ? (
        <Image
          src={artwork.url}
          alt={artwork.alt}
          width={48}
          height={48}
          className="size-12 rounded-md object-cover"
        />
      ) : (
        <span className="block size-12 rounded-md bg-seam" />
      )}
      {badge && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 size-5 overflow-hidden rounded-full border-2 border-raised",
            badge.dark && "bg-on-bright",
          )}
        >
          <Image src={badge.url} alt={badge.alt} width={20} height={20} />
        </span>
      )}
    </span>
  );
}

function Playing({
  presence,
}: {
  presence: Extract<Presence, { kind: "playing" }>;
}) {
  const t = useTranslations("Presence");
  const [now, setNow] = useState<number | null>(null);
  const { startedAt } = presence;

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const detail = [presence.details, presence.state].filter(Boolean).join(" · ");

  return (
    <>
      <Artwork artwork={presence.artwork} badge={presence.badge} />
      <span className="min-w-0 flex-1">
        <Line className="text-label text-ink">{presence.name}</Line>
        <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-online motion-safe:animate-breathe"
          />
          {startedAt && now !== null ? (
            <>
              <TypographyData className="shrink-0" aria-hidden>
                {formatElapsed(now - startedAt)}
              </TypographyData>
              <span className="sr-only">
                {t("playingFor", { elapsed: formatElapsed(now - startedAt) })}
              </span>
            </>
          ) : (
            <TypographyData className="shrink-0">{t("playing")}</TypographyData>
          )}
          {detail && <Line className="text-data">{detail}</Line>}
        </span>
      </span>
      {/* Lucas at his game, in his day or night outfit by Paris time */}
      <ChibiSprite
        pose="lol"
        alt=""
        sizes="56px"
        followParisNight
        className="-my-2 size-14 shrink-0"
      />
    </>
  );
}

function Listening({
  presence,
}: {
  presence: Extract<Presence, { kind: "listening" }>;
}) {
  const t = useTranslations("Presence");
  return (
    <>
      <Artwork
        artwork={presence.artwork}
        badge={{
          url: "/images/spotify-logo.png",
          alt: t("spotifyLogo"),
          dark: true,
        }}
      />
      <span className="min-w-0 flex-1">
        <Line className="text-label text-ink">{presence.song}</Line>
        <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
          <Equalizer />
          <Line className="text-data">
            {t("listeningBy", { artist: presence.artist })}
          </Line>
        </span>
      </span>
      {/* The music pose plays its two drawn frames while Lucas listens */}
      <ChibiSprite
        pose="music"
        alt=""
        sizes="56px"
        playing
        className="-my-2 size-14 shrink-0"
      />
    </>
  );
}

/** Three bars while Lucas listens; still under reduced motion. */
function Equalizer() {
  return (
    <span aria-hidden className="flex h-3 shrink-0 items-end gap-[2px]">
      {[0, 0.25, 0.5].map((delay) => (
        <span
          key={delay}
          className="h-full w-[2px] origin-bottom scale-y-50 rounded-full bg-online motion-safe:animate-equalizer"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function Status({
  status,
}: {
  status: Extract<Presence, { kind: "status" }>["status"];
}) {
  const t = useTranslations("Presence");
  const offline = status === "offline";
  return (
    <>
      {offline ? (
        <ChibiSprite
          pose="sleeping"
          alt={t("sleepingAlt")}
          sizes="56px"
          className="-my-1 size-14 shrink-0"
        />
      ) : (
        <ChibiHead size={44} decorative className="mx-0.5" />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("size-2 rounded-full", STATUS_DOT[status])}
          />
          <span
            className={cn(
              "text-label",
              offline ? "text-common-ink" : "text-ink",
            )}
          >
            {t(`status.${status}`)}
          </span>
        </span>
        <Line className="text-data text-ink-muted">{t(`line.${status}`)}</Line>
      </span>
    </>
  );
}

function Connecting() {
  const t = useTranslations("Presence");
  return (
    <>
      <span className="sr-only">{t("status.connecting")}</span>
      <span
        aria-hidden
        className="size-12 shrink-0 rounded-md bg-seam motion-safe:animate-skeleton"
      />
      <span aria-hidden className="flex flex-1 flex-col gap-2">
        <span className="h-3 w-3/4 rounded-full bg-seam motion-safe:animate-skeleton" />
        <span className="h-3 w-1/2 rounded-full bg-seam motion-safe:animate-skeleton" />
      </span>
    </>
  );
}
