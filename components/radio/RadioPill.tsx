"use client";

import { useTranslations } from "next-intl";

import { Pause, Play } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { Equalizer } from "@/components/sound/Equalizer";
import { useSounds } from "@/components/sound/SoundProvider";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { isOn } from "@/lib/radio/radio";

import { useRadio } from "./RadioProvider";
import { RADIO_BUTTON } from "./RadioSlot";

/**
 * Now playing, on phones (below 768px), once the radio has started: a pill
 * floating at the panel's foot with the music pose, the track and play or
 * pause. The track opens the client sheet, where the whole radio is.
 */
export function RadioPill() {
  const t = useTranslations("Radio");
  const { state, track, toggle } = useRadio();
  const { isOpen, toggleMenu } = useMobileMenu();
  const { play } = useSounds();
  if (state.status === "off" || isOpen) return null;
  const on = isOn(state);

  return (
    <div
      role="region"
      aria-label={t("nowPlaying")}
      className="fixed inset-x-0 bottom-4 z-30 mx-auto flex h-14 w-[min(22rem,calc(100%-2.5rem))] items-center gap-2 rounded-full border-2 border-seam bg-raised p-1.5 shadow-[var(--float),var(--tray)] motion-safe:animate-window-in motion-reduce:animate-fade-in md:hidden"
    >
      <button
        type="button"
        onClick={() => {
          play("toggleOn");
          toggleMenu();
        }}
        aria-label={t("openRadio", { title: track.title })}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full pr-1"
      >
        <span className="relative flex size-10 shrink-0 items-end justify-center overflow-hidden rounded-full bg-ground">
          <ChibiSprite
            pose="music"
            alt=""
            sizes="48px"
            playing={on}
            className="absolute -bottom-1 size-12"
          />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-label text-ink">
            {track.title}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
            <Equalizer playing={on} className="h-2.5 text-online-ink" />
            <span className="truncate font-mono text-data">{track.artist}</span>
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? t("pause") : t("play")}
        className={`${RADIO_BUTTON} rounded-full`}
      >
        {on ? (
          <Pause aria-hidden className="size-5" fill="currentColor" />
        ) : (
          <Play aria-hidden className="size-5" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
