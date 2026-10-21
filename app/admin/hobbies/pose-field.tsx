"use client";

import { useId } from "react";
import Image from "next/image";

import { FieldError, FieldLabel, useFieldError } from "@/app/admin/admin-form";
import { chibiFrames } from "@/lib/chibi";
import type { HobbyPose } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** The poses of Lucas's chibi avatar, labelled in French. */
const POSES: ReadonlyArray<readonly [HobbyPose, string]> = [
  ["surf", "surf"],
  ["skate", "skate"],
  ["lol", "LoL"],
  ["coding", "code"],
  ["coffee", "café"],
  ["series", "série"],
  ["music", "musique"],
];

/**
 * A Hobby's pose, picked by its picture: each pose stands on its stage disc,
 * the chosen one ringed in the action ink. None is chosen on a new Hobby.
 */
export const PoseField: React.FC<{ defaultValue?: HobbyPose }> = ({
  defaultValue,
}) => {
  const error = useFieldError("pose");
  const errorId = useId();
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1.5">
        <FieldLabel label="Pose" />
      </legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 md:max-lg:grid-cols-4">
        {POSES.map(([pose, label]) => (
          <label
            key={pose}
            className={cn(
              "group flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-seam bg-ground px-1 pb-1.5 pt-1 text-tag text-ink-muted transition-colors duration-hover hover:border-ink-muted/40 has-[:checked]:border-action-ink has-[:checked]:text-ink",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink",
              error && "border-busy-ink",
            )}
          >
            <input
              type="radio"
              name="pose"
              value={pose}
              defaultChecked={defaultValue === pose}
              className="sr-only"
            />
            <span className="relative block aspect-square w-full max-w-16">
              <span
                aria-hidden
                className="absolute inset-x-[8%] bottom-[4%] top-[16%] rounded-full bg-raised group-has-[:checked]:bg-seam"
              />
              <Image
                src={chibiFrames(pose)[0]}
                alt=""
                width={128}
                height={128}
                sizes="64px"
                loading="eager"
                className="relative size-full object-contain"
              />
            </span>
            <span className="w-full truncate text-center">{label}</span>
          </label>
        ))}
      </div>
      <FieldError name="pose" id={errorId} />
    </fieldset>
  );
};
