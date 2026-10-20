"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { GraduationCap } from "lucide-react";

import { useSounds } from "@/components/sound/SoundProvider";
import {
  TypographyData,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { cn } from "@/lib/utils";

/** Diploma names are in the message dictionaries; institutions are proper nouns. */
const DIPLOMAS = [
  { key: "master", institution: "IIM", years: "2023 - 2025" },
  { key: "bachelor", institution: "Need For School", years: "2020 - 2023" },
  {
    key: "baccalaureate",
    institution: "Lycée Galilée, Franqueville St Pierre",
    years: "2019",
  },
] as const;

type Diploma = (typeof DIPLOMAS)[number];

/**
 * The diplomas as medals Lucas earned: a coin lettered with its level, then
 * the diploma, the school and the years.
 */
export function Diplomas() {
  return (
    <ul className="grid gap-slot-gap md:grid-cols-3">
      {DIPLOMAS.map((diploma) => (
        <DiplomaSlot key={diploma.key} diploma={diploma} />
      ))}
    </ul>
  );
}

function DiplomaSlot({ diploma }: { diploma: Diploma }) {
  const t = useTranslations("Experiences.diplomas");
  const { play } = useSounds();
  const level = t(`levels.${diploma.key}`);
  return (
    <li
      onPointerEnter={() => play("tick")}
      className="group tray flex items-center gap-4 rounded-lg bg-raised p-4 md:flex-col md:items-center md:p-card md:text-center"
    >
      <Medal
        level={level}
        years={diploma.years}
        label={t("flip", { diploma: level })}
      />
      <div className="flex min-w-0 flex-col gap-1.5 md:items-center">
        <TypographyTitle as="h3">{t(diploma.key)}</TypographyTitle>
        <TypographyMuted>{diploma.institution}</TypographyMuted>
        <TypographyData className="text-ink-muted">
          {diploma.years}
        </TypographyData>
      </div>
    </li>
  );
}

/**
 * A medal is a toy: a round coin on its ledge with its level lettered on the
 * face. Hovering its slot (fine pointers) turns it like a coin to its back,
 * Lucas's head and the year it was minted; pressing it keeps it turned. Under reduced
 * motion the faces swap without turning.
 */
function Medal({
  level,
  years,
  label,
}: {
  level: string;
  years: string;
  label: string;
}) {
  const { play } = useSounds();
  const [flipped, setFlipped] = useState(false);
  // The year it was earned: the last year of the diploma
  const minted = years.split(" - ").at(-1);
  const face =
    "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full border-2 border-seam bg-ground [backface-visibility:hidden]";
  // The rim: a stitched inner ring, like a pressed coin
  const rim = (
    <span className="absolute inset-1.5 rounded-full border-2 border-dashed border-seam" />
  );

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={flipped}
      onClick={() => {
        play(flipped ? "toggleOff" : "toggleOn");
        setFlipped((f) => !f);
      }}
      className="ledge relative size-24 shrink-0 rounded-full [perspective:600px] md:size-28"
    >
      <span
        className={cn(
          "absolute inset-0 transition-transform duration-[600ms] ease-out [transform-style:preserve-3d] motion-reduce:transition-none",
          flipped
            ? "[transform:rotateY(180deg)]"
            : "[@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]",
        )}
      >
        <span className={face}>
          {rim}
          <GraduationCap
            aria-hidden
            className="size-5 text-ink-muted md:size-6"
          />
          <span className="font-display text-[0.6875rem] font-bold leading-none text-ink md:text-[0.8125rem]">
            {level}
          </span>
        </span>
        {/* The back: Lucas's head stamped like a minted coin, and its year */}
        <span className={cn(face, "[transform:rotateY(180deg)]")}>
          {rim}
          <Image
            src="/images/chibi-avatar-64x64.png"
            alt=""
            width={64}
            height={64}
            className="size-11 rounded-full md:size-12"
          />
          <span className="font-mono text-[0.6875rem] font-semibold leading-none tabular-nums text-ink-muted">
            {minted}
          </span>
        </span>
      </span>
    </button>
  );
}
