"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useParisDecember } from "@/components/chibi/use-paris-december";
import { useSounds } from "@/components/sound/SoundProvider";
import { bannerPose, boopPoses, type ChibiPose } from "@/lib/chibi";
import { cn } from "@/lib/utils";

/**
 * The banner chibi, waving in his day or night outfit by Lucas's time in
 * Paris, in his Christmas hat all December. Booping him swaps to another of
 * his poses with a boop; he never hops, all his movement is in the drawn
 * frames.
 */
export function BannerChibi({ className }: { className?: string }) {
  const t = useTranslations("Home");
  const { play } = useSounds();
  const december = useParisDecember();
  // Until the first boop he rests in the season's banner pose
  const [booped, setBooped] = useState<ChibiPose | null>(null);
  const pose = booped ?? bannerPose(december);
  const [hovered, setHovered] = useState(false);

  const boop = () => {
    const random = Math.random();
    play("boop", { random });
    const others = boopPoses(december).filter(
      (candidate) => candidate !== pose,
    );
    setBooped(others[Math.floor(random * others.length)]);
  };

  return (
    <button
      type="button"
      onClick={boop}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-label={t("boop")}
      className={cn("relative rounded-lg", className)}
    >
      <ChibiSprite
        pose={pose}
        alt={t(december ? "bannerAltChristmas" : "bannerAlt")}
        sizes="(min-width: 768px) 260px, 120px"
        playing={hovered}
        followParisNight
        priority
        className="size-full"
      />
    </button>
  );
}
