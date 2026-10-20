"use client";

import { useState } from "react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useSounds } from "@/components/sound/SoundProvider";
import type { HobbyInLocale } from "@/lib/content/types";

/**
 * What Lucas does when he is not shipping: one chibi pose per Hobby, from
 * the content, in his order. A pose with drawn frames plays them on hover.
 */
export function Hobbies({
  hobbies,
}: {
  hobbies: ReadonlyArray<HobbyInLocale>;
}) {
  return (
    <ul className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4">
      {hobbies.map((hobby) => (
        <Hobby key={hobby.pose + hobby.label} hobby={hobby} />
      ))}
    </ul>
  );
}

function Hobby({ hobby }: { hobby: HobbyInLocale }) {
  const { play } = useSounds();
  const [hovered, setHovered] = useState(false);
  return (
    <li
      onPointerEnter={() => {
        setHovered(true);
        play("tick");
      }}
      onPointerLeave={() => setHovered(false)}
      className="flex flex-col items-center gap-1 text-center"
    >
      <ChibiSprite
        pose={hobby.pose}
        alt=""
        sizes="96px"
        playing={hovered}
        followParisNight
        className="size-20 sm:size-24"
      />
      <span className="text-label text-ink">{hobby.label}</span>
    </li>
  );
}
