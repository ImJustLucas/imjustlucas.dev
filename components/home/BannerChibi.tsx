"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useSounds } from "@/components/sound/SoundProvider";
import { BOOP_POSES, type ChibiPose } from "@/lib/chibi";
import { cn } from "@/lib/utils";

/**
 * The banner chibi, waving in his day or night outfit by Lucas's time in
 * Paris. Booping him swaps to another of his poses with a boop; he never
 * hops, all his movement is in the drawn frames.
 */
export function BannerChibi({ className }: { className?: string }) {
  const t = useTranslations("Home");
  const { play } = useSounds();
  const [pose, setPose] = useState<ChibiPose>("banner");
  const [hovered, setHovered] = useState(false);

  const boop = () => {
    const random = Math.random();
    play("boop", { random });
    const others = BOOP_POSES.filter((candidate) => candidate !== pose);
    setPose(others[Math.floor(random * others.length)]);
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
        alt={t("bannerAlt")}
        sizes="(min-width: 768px) 260px, 120px"
        playing={hovered}
        followParisNight
        priority
        className="size-full"
      />
    </button>
  );
}
