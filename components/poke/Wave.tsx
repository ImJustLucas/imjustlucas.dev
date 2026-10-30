"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Hand, X } from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { NAME_MAX_LENGTH } from "@/lib/arcade/player-name";
import { EMOTE_GLYPH, EMOTES, isEmote } from "@/lib/poke/emotes";
import type { WaveView } from "@/lib/poke/visit";
import { cn } from "@/lib/utils";

import { usePoke } from "./PokeProvider";

/**
 * The wave at Lucas (DESIGN.md, Wave): a row of emote keys, each one sending
 * its emote to his Discord, on the contact screen and under the friends
 * panel. Once sent, the keys give way to the wave for the visitor's day.
 */

/** The contact screen's row, under "also on", in its rule: always open. */
export function ContactWave() {
  const t = useTranslations("Poke");
  const { enabled, view, problem } = usePoke();
  const labelId = useId();
  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <span
        id={labelId}
        className="whitespace-nowrap text-label text-ink-muted"
      >
        {t("contactLabel")}
      </span>
      <div className="flex min-h-11 min-w-0 flex-col gap-2">
        {view?.kind === "sent" ? (
          <WaveSent view={view} />
        ) : (
          view && (
            <>
              <NameField />
              <EmoteKeys labelledBy={labelId} />
            </>
          )
        )}
        {problem && view?.kind !== "sent" && <Problem />}
      </div>
    </div>
  );
}

/**
 * The friends panel's row: a ledge button that opens, in its place, the
 * first-name field over the emote keys.
 */
export function PanelWave() {
  const t = useTranslations("Poke");
  const { enabled, view, problem, name } = usePoke();
  const { play } = useSounds();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  if (!enabled) return null;
  // Room kept while the browser's own wave is read
  if (!view) return <div aria-hidden className="h-11" />;
  if (view.kind === "sent") return <WaveSent view={view} compact />;

  const close = () => {
    play("toggleOff");
    setOpen(false);
    window.requestAnimationFrame(() => trigger.current?.focus());
  };

  return (
    <div className="flex flex-col gap-2">
      {open ? (
        <div
          className="flex flex-col gap-2"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
        >
          {/* The name first while there is none, the keys once there is */}
          <NameField autoFocus={!name} wide />
          <div className="flex h-11 items-center gap-1">
            {/* The keys share the panel's width with the close key */}
            <EmoteKeys label={t("trayLabel")} autoFocus={!!name} fill />
            <SoundOnPress cue={null} tick>
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className="w-9 shrink-0"
              >
                <X aria-hidden className="!size-5" />
                <span className="sr-only">{t("close")}</span>
              </Button>
            </SoundOnPress>
          </div>
        </div>
      ) : (
        <Button
          ref={trigger}
          aria-expanded={false}
          onClick={() => {
            play("toggleOn");
            setOpen(true);
          }}
          className="w-full justify-start px-3"
        >
          <Hand aria-hidden className="!size-[18px]" />
          {t("open")}
          {/* The emotes waiting behind the button */}
          <span
            aria-hidden
            className="ml-auto text-[0.8125rem] tracking-[0.2em] opacity-70"
          >
            {EMOTES.map((emote) => EMOTE_GLYPH[emote]).join("")}
          </span>
        </Button>
      )}
      {problem && <Problem />}
    </div>
  );
}

/**
 * The visitor's first name, optional, sent with their waves from anywhere
 * on the site. Outside the keys' form, so Enter in it never sends a wave.
 */
function NameField({
  autoFocus = false,
  wide = false,
}: {
  autoFocus?: boolean;
  /** Takes the row's whole width (the friends panel). */
  wide?: boolean;
}) {
  const t = useTranslations("Poke");
  const { name, setName, nameProblem, sending } = usePoke();
  const problemId = useId();
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) field.current?.focus();
    // Only on mount: typing must not move the focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={field}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label={t("nameLabel")}
        placeholder={t("nameLabel")}
        autoComplete="given-name"
        maxLength={NAME_MAX_LENGTH + 8}
        disabled={sending !== null}
        aria-invalid={nameProblem !== null}
        aria-describedby={nameProblem ? problemId : undefined}
        className={cn(
          "h-11 w-full rounded-md border-2 border-seam bg-ground px-3 text-base text-ink transition-colors duration-hover ease-out placeholder:text-ink-muted/75 hover:border-ink-muted/40 aria-[invalid=true]:border-busy-ink",
          !wide && "max-w-[16rem]",
        )}
      />
      {nameProblem && (
        <span id={problemId} role="alert" className="text-label text-busy-ink">
          {t(`nameProblems.${nameProblem}`)}
        </span>
      )}
    </div>
  );
}

/**
 * The emote keys, one form: each key submits its emote. The form carries a
 * field no person sees, the honeypot, which only a form-filling bot fills.
 */
function EmoteKeys({
  labelledBy,
  label,
  autoFocus = false,
  fill = false,
}: {
  labelledBy?: string;
  label?: string;
  autoFocus?: boolean;
  /** Shares a row's width: the keys stretch or narrow together. */
  fill?: boolean;
}) {
  const t = useTranslations("Poke");
  const { sending, send, nameProblem } = usePoke();
  const first = useRef<HTMLButtonElement>(null);
  // A name the server would refuse holds the keys, which always sit under
  // the field; only the quick menu, which has none, sends without it
  const held = nameProblem !== null;

  useEffect(() => {
    if (autoFocus) first.current?.focus();
    // Only on mount: the keys take focus when the tray opens, not later
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      role="group"
      aria-labelledby={labelledBy}
      aria-label={label}
      aria-busy={sending !== null}
      className={cn(
        "relative flex gap-1.5",
        fill ? "min-w-0 flex-1 gap-1" : "flex-wrap",
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const emote = (
          event.nativeEvent as SubmitEvent
        ).submitter?.getAttribute("value");
        const website = new FormData(event.currentTarget).get("website");
        if (isEmote(emote)) {
          send(emote, { website: typeof website === "string" ? website : "" });
        }
      }}
    >
      <div
        aria-hidden
        className="absolute -left-[9999px] size-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {EMOTES.map((emote, index) => {
        const name = t(`emotes.${emote}`);
        return (
          <SoundOnPress key={emote} cue={null} tick>
            <Button
              ref={index === 0 ? first : undefined}
              type="submit"
              value={emote}
              variant="outline"
              size="icon"
              title={name}
              aria-label={t("send", { emote: name })}
              disabled={sending !== null || held}
              className={cn(
                "text-[1.375rem] leading-none",
                fill && "min-w-0 flex-1",
                sending !== null && sending !== emote && "opacity-40",
                sending === emote &&
                  "translate-y-1 shadow-none motion-safe:animate-pulse",
              )}
            >
              <span aria-hidden>{EMOTE_GLYPH[emote]}</span>
            </Button>
          </SoundOnPress>
        );
      })}
    </form>
  );
}

/** The wave sent today, and Lucas's answer once he gave it. */
function WaveSent({
  view,
  compact = false,
}: {
  view: Extract<WaveView, { kind: "sent" }>;
  compact?: boolean;
}) {
  const t = useTranslations("Poke");
  // No emote: the server said this visitor had already waved elsewhere
  const line = view.wavedBack
    ? t("wavedBack")
    : view.emote
      ? t("sent")
      : t("limited");
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        compact && "tray h-11 gap-2.5 rounded-md bg-raised pl-1.5 pr-3",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-ground leading-none ring-2",
          compact ? "size-8 text-base" : "size-11 text-[1.375rem]",
          view.wavedBack ? "ring-online" : "ring-seam",
        )}
      >
        {EMOTE_GLYPH[view.emote ?? "wave"]}
      </span>
      <span
        title={compact ? line : undefined}
        className={cn("text-label text-ink-muted", compact && "truncate")}
      >
        {line}
      </span>
    </div>
  );
}

/** Why the wave did not go out, calmly, under the keys. */
function Problem() {
  const t = useTranslations("Poke");
  const { problem } = usePoke();
  if (!problem) return null;
  return <TypographyMuted className="px-1">{t(problem)}</TypographyMuted>;
}
