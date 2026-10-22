"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Globe, Monitor, Smartphone } from "lucide-react";

import { ChibiHead } from "@/components/chibi/ChibiHead";
import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { TypographyData, TypographyTag } from "@/components/typography";
import { cn } from "@/lib/utils";

import { formatElapsed } from "./format-elapsed";
import { presenceActivity } from "./presence-activity";
import { usePresence } from "./PresenceProvider";
import type {
  Presence,
  PresenceDevice,
  PresenceImage,
  PresenceMessage,
} from "./select-presence";
import { STATUS_DOT } from "./status-style";
import { trackProgress } from "./track-progress";

/**
 * The friends panel: Lucas's live Discord presence, always shown, in a slot
 * of fixed height so the sidebar never jumps between states.
 */
export function FriendsPanel() {
  const { presence, status, device } = usePresence();
  const t = useTranslations("Presence");
  const live = status !== "connecting" && status !== "offline";

  return (
    <section aria-labelledby="friends-title" className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span id="friends-title" className="text-label text-ink-muted">
          {t("title")}
        </span>
        {live && (
          <TypographyTag className="flex items-center gap-1 rounded-full bg-online px-2 py-0.5 text-on-bright">
            {device && <DeviceMark device={device} />}
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
 * Says aloud, politely, when Lucas starts or stops a game, starts coding,
 * watching or listening, or changes status, once the change has held for a
 * moment. The first state after connecting is not announced, nor the
 * elapsed time, the track, the language or his own line.
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
      case "coding":
        return t("announce.coding");
      case "watching":
        return t("announce.watching", { name: presence.name });
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
    case "coding":
      return <Coding presence={presence} />;
    case "watching":
      return <Watching presence={presence} />;
    case "listening":
      return <Listening presence={presence} />;
    case "status":
      return <Status status={presence.status} message={presence.message} />;
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

/**
 * The device Lucas is on, as a small line icon inside a status tag; its
 * name is read to assistive tech and shown as a native tooltip.
 */
export function DeviceMark({ device }: { device: PresenceDevice }) {
  const t = useTranslations("Presence");
  const Icon = DEVICE_ICON[device];
  const label = t(`device.${device}`);
  return (
    <span title={label} className="inline-flex">
      <Icon aria-hidden className="size-3" strokeWidth={2.5} />
      {/* Read before the status: "on his phone, online" */}
      <span className="sr-only">{`${label}, `}</span>
    </span>
  );
}

const DEVICE_ICON = {
  desktop: Monitor,
  mobile: Smartphone,
  web: Globe,
} as const;

function Artwork({
  artwork,
  badge,
}: {
  artwork?: PresenceImage;
  badge?: PresenceImage & { dark?: boolean };
}) {
  const [failed, setFailed] = useState<ReadonlyArray<string>>([]);
  const fail = (url: string) => () => setFailed((urls) => [...urls, url]);
  const art = artwork && !failed.includes(artwork.url) ? artwork : undefined;
  const mark = badge && !failed.includes(badge.url) ? badge : undefined;

  return (
    <span className="relative size-12 shrink-0">
      {art ? (
        <Image
          src={art.url}
          alt={art.alt}
          width={48}
          height={48}
          onError={fail(art.url)}
          className="size-12 rounded-md object-cover"
        />
      ) : (
        // No art, or art that would not load: the seam placeholder
        <span className="block size-12 rounded-md bg-seam" />
      )}
      {mark && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 size-5 overflow-hidden rounded-full border-2 border-raised",
            mark.dark && "bg-on-bright",
          )}
        >
          <Image
            src={mark.url}
            alt={mark.alt}
            width={20}
            height={20}
            onError={fail(mark.url)}
          />
        </span>
      )}
    </span>
  );
}

/** The time now, every second, while a session with a start is shown. */
function useNow(startedAt: number | undefined) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return startedAt ? now : null;
}

/**
 * The second line of a session: a breathing Online dot, the elapsed time in
 * Data (the verb until it is known) and a detail.
 */
function SessionLine({
  startedAt,
  verb,
  elapsedLabel,
  detail,
}: {
  startedAt?: number;
  verb: string;
  /** What screen readers hear instead of the bare elapsed time. */
  elapsedLabel: (elapsed: string) => string;
  detail?: string;
}) {
  const now = useNow(startedAt);
  const elapsed =
    startedAt && now !== null ? formatElapsed(now - startedAt) : null;

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full bg-online motion-safe:animate-breathe"
      />
      {elapsed ? (
        <>
          <TypographyData className="shrink-0" aria-hidden>
            {elapsed}
          </TypographyData>
          <span className="sr-only">{elapsedLabel(elapsed)}</span>
        </>
      ) : (
        <TypographyData className="shrink-0">{verb}</TypographyData>
      )}
      {detail && <Line className="text-data">{detail}</Line>}
    </span>
  );
}

function Playing({
  presence,
}: {
  presence: Extract<Presence, { kind: "playing" }>;
}) {
  const t = useTranslations("Presence");
  const detail = [presence.details, presence.state].filter(Boolean).join(" · ");

  return (
    <>
      <Artwork artwork={presence.artwork} badge={presence.badge} />
      <span className="min-w-0 flex-1">
        <Line className="text-label text-ink">{presence.name}</Line>
        <SessionLine
          startedAt={presence.startedAt}
          verb={t("playing")}
          elapsedLabel={(elapsed) => t("playingFor", { elapsed })}
          detail={detail}
        />
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

function Coding({
  presence,
}: {
  presence: Extract<Presence, { kind: "coding" }>;
}) {
  const t = useTranslations("Presence");
  const { language, project, editor } = presence;
  // The project leads, like a game's name; without one, the language does
  const title =
    project ?? (language ? t("codingIn", { language }) : t("coding"));
  const detail = project ? (language ?? editor) : editor;

  return (
    <>
      <Artwork artwork={presence.artwork} badge={presence.badge} />
      <span className="min-w-0 flex-1">
        <Line className="text-label text-ink">{title}</Line>
        <SessionLine
          startedAt={presence.startedAt}
          verb={t("coding")}
          elapsedLabel={(elapsed) => t("codingFor", { elapsed })}
          detail={detail}
        />
      </span>
      {/* Lucas at his laptop */}
      <ChibiSprite
        pose="coding"
        alt=""
        sizes="56px"
        className="-my-2 size-14 shrink-0"
      />
    </>
  );
}

function Watching({
  presence,
}: {
  presence: Extract<Presence, { kind: "watching" }>;
}) {
  const t = useTranslations("Presence");
  const detail = [presence.details, presence.state].filter(Boolean).join(" · ");

  return (
    <>
      <Artwork artwork={presence.artwork} badge={presence.badge} />
      <span className="min-w-0 flex-1">
        <Line className="text-label text-ink">{presence.name}</Line>
        <SessionLine
          startedAt={presence.startedAt}
          verb={t("watching")}
          elapsedLabel={(elapsed) => t("watchingFor", { elapsed })}
          detail={detail}
        />
      </span>
      {/* Lucas under his blanket, popcorn in his lap */}
      <ChibiSprite
        pose="series"
        alt=""
        sizes="56px"
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
  const row = (
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
        {presence.startedAt && presence.endsAt && (
          <TrackBar startedAt={presence.startedAt} endsAt={presence.endsAt} />
        )}
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

  if (!presence.url) return row;

  // The whole slot opens the track on Spotify, its focus ring drawn inside
  return (
    <SoundOnPress>
      <a
        href={presence.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("listenOnSpotify", {
          song: presence.song,
          artist: presence.artist,
        })}
        title={t("listenOnSpotifyShort")}
        className="-m-3 flex min-w-0 flex-1 items-center gap-3 self-stretch rounded-lg p-3 transition-colors duration-150 ease-out hover:bg-seam/40 focus-visible:outline-offset-[-2px]"
      >
        {row}
      </a>
    </SoundOnPress>
  );
}

/**
 * How far the track has played: a thin Online bar on a seam track, moved
 * once a second (a step of about a pixel, so it needs no tween).
 */
function TrackBar({
  startedAt,
  endsAt,
}: {
  startedAt: number;
  endsAt: number;
}) {
  const now = useNow(startedAt);
  const progress = now === null ? 0 : trackProgress(now, startedAt, endsAt);

  return (
    <span
      aria-hidden
      className="mt-1.5 block h-1 overflow-hidden rounded-full bg-seam"
    >
      <span
        className="block h-full origin-left rounded-full bg-online-ink"
        style={{ transform: `scaleX(${progress})` }}
      />
    </span>
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
  message,
}: {
  status: Extract<Presence, { kind: "status" }>["status"];
  message?: PresenceMessage;
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
        {message ? (
          <OwnLine message={message} />
        ) : (
          <Line className="text-data text-ink-muted">
            {t(`line.${status}`)}
          </Line>
        )}
      </span>
    </>
  );
}

/** The line Lucas wrote himself, with its emoji, in place of the stock one. */
function OwnLine({ message }: { message: PresenceMessage }) {
  const text = [message.emoji, message.text].filter(Boolean).join(" ");
  return (
    <span className="flex min-w-0 items-center gap-1 text-data text-ink-muted">
      {message.emojiImage && (
        <Image
          src={message.emojiImage.url}
          alt={message.emojiImage.alt}
          width={16}
          height={16}
          unoptimized
          className="size-4 shrink-0"
        />
      )}
      {text && <Line>{text}</Line>}
    </span>
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
