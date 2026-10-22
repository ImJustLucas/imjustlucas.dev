"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useParisDecember } from "@/components/chibi/use-paris-december";
import { activityPose } from "@/components/presence/activity-pose";
import { usePresence } from "@/components/presence/PresenceProvider";
import { useSounds } from "@/components/sound/SoundProvider";
import { bannerPose, boopPoses, type ChibiPose } from "@/lib/chibi";
import { cn } from "@/lib/utils";

/**
 * The banner chibi, waving in his day or night outfit by Lucas's time in
 * Paris, in his Christmas hat all December, or striking the pose of what
 * Lucas is doing live (gaming, coding, watching, listening, away, asleep).
 * Booping him swaps to another of his poses with a boop, until Lucas's
 * activity changes; he never hops, all his movement is in the drawn frames.
 */
export function BannerChibi({ className }: { className?: string }) {
  const t = useTranslations("Home");
  const { play } = useSounds();
  const tPresence = useTranslations("Presence");
  const december = useParisDecember();
  const { presence } = usePresence();
  const live = activityPose(presence);
  // Until the first boop he rests in his live pose or the season's banner
  const [booped, setBooped] = useState<ChibiPose | null>(null);
  // A new activity wins over the last boop
  const [boopedDuring, setBoopedDuring] = useState(live);
  if (boopedDuring !== live) {
    setBoopedDuring(live);
    setBooped(null);
  }
  const pose = booped ?? live ?? bannerPose(december);
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
        alt={
          !booped && live
            ? tPresence(`poseAlt.${live}`)
            : t(december ? "bannerAltChristmas" : "bannerAlt")
        }
        sizes="(min-width: 768px) 260px, 120px"
        // The music pose keeps stepping while he listens
        playing={hovered || (!booped && live === "music")}
        followParisNight
        priority
        className="size-full"
      />
    </button>
  );
}
