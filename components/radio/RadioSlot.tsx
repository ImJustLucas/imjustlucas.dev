"use client";

import { useId, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { CloudRain, Music2, Pause, Play, SkipForward } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { Equalizer } from "@/components/sound/Equalizer";
import { isOn } from "@/lib/radio/radio";
import { cn } from "@/lib/utils";

import { useRadio } from "./RadioProvider";

/** A 44px outline button on the raised slot, sinking onto its ledge. */
export const RADIO_BUTTON =
  "ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-seam bg-ground text-ink";

/**
 * The radio at the sidebar's foot (DESIGN.md, Radio): the music pose on its
 * stage disc, playing its frames while the radio plays, the track and its
 * artist, play and next; once started, the track's progress and the mix
 * (music volume, rain on or off and its volume).
 */
export function RadioSlot() {
  const t = useTranslations("Radio");
  const { state, track, toggle, next } = useRadio();
  const on = isOn(state);
  const started = state.status !== "off";

  return (
    <section
      aria-label={t("title")}
      className="tray -mb-1 flex flex-col gap-2 rounded-lg bg-raised p-1.5"
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex size-11 shrink-0 items-end justify-center overflow-hidden rounded-full bg-ground">
          <ChibiSprite
            pose="music"
            alt=""
            sizes="52px"
            playing={on}
            className="absolute -bottom-1 size-[52px]"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span
            title={started ? track.title : undefined}
            className="block truncate text-label text-ink"
          >
            {started ? track.title : t("idleTitle")}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
            {started && (
              <Equalizer playing={on} className="h-2.5 text-online-ink" />
            )}
            <span className="truncate font-mono text-data">
              {started ? (
                <a
                  href={track.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("source")}
                  className="rounded-sm underline decoration-seam decoration-2 underline-offset-4 transition-colors duration-hover ease-out hover:text-ink"
                >
                  {track.artist}
                </a>
              ) : (
                t("idleLine")
              )}
            </span>
          </span>
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-label={on ? t("pause") : t("play")}
          className={RADIO_BUTTON}
        >
          {on ? (
            <Pause aria-hidden className="size-5" fill="currentColor" />
          ) : (
            <Play aria-hidden className="size-5" fill="currentColor" />
          )}
        </button>
        {started && (
          <button
            type="button"
            onClick={next}
            aria-label={t("next")}
            className={RADIO_BUTTON}
          >
            <SkipForward aria-hidden className="size-5" />
          </button>
        )}
      </div>
      {started && (
        <div className="flex flex-col gap-1 px-1">
          <TrackBar />
          <Mixer />
        </div>
      )}
    </section>
  );
}

/** How far the track has played, moved as the audio reports it. */
function TrackBar() {
  const { subscribeProgress, progress } = useRadio();
  const { at, duration } = useSyncExternalStore(
    subscribeProgress,
    progress,
    progress,
  );
  const ratio = duration > 0 ? Math.min(1, at / duration) : 0;
  return (
    <span
      aria-hidden
      className="block h-1 overflow-hidden rounded-full bg-seam"
    >
      <span
        className="block h-full origin-left rounded-full bg-online-ink"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </span>
  );
}

/** Music volume, then the rain's switch and volume. */
function Mixer() {
  const t = useTranslations("Radio");
  const { state, setVolume, toggleRain, setRainVolume } = useRadio();
  return (
    <div className="-my-1 flex items-center gap-2">
      <Music2 aria-hidden className="size-4 shrink-0 text-ink-muted" />
      <Slider
        label={t("volume")}
        value={state.volume}
        onChange={setVolume}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        onClick={toggleRain}
        aria-pressed={state.rain}
        aria-label={t("rain")}
        title={state.rain ? t("rainOn") : t("rainOff")}
        className={cn(
          RADIO_BUTTON,
          "ml-1",
          state.rain
            ? "border-action-ink/70 text-action-ink"
            : "text-ink-muted",
        )}
      >
        <CloudRain aria-hidden className="size-5" />
      </button>
      <Slider
        label={t("rainVolume")}
        value={state.rainVolume}
        onChange={setRainVolume}
        disabled={!state.rain}
        className="min-w-0 flex-1"
      />
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  disabled = false,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const percent = Math.round(value * 100);
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        disabled={disabled}
        aria-valuetext={`${percent}%`}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className={cn("range", className)}
        style={{ "--fill": `${percent}%` } as React.CSSProperties}
      />
    </>
  );
}
