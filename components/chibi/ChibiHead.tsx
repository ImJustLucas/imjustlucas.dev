"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { usePresence } from "@/components/presence/PresenceProvider";
import { STATUS_RING } from "@/components/presence/status-style";
import { cn } from "@/lib/utils";

/**
 * The commissioned chibi head in a status ring coloured by Lucas's live
 * Discord status (Common when offline, Seam while connecting).
 */
export function ChibiHead({
  size,
  className,
}: {
  /** Head diameter in pixels, inside the 3px ring. */
  size: number;
  className?: string;
}) {
  const { status } = usePresence();
  const t = useTranslations("Presence");
  const tLayout = useTranslations("Layout");

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-ground ring-[3px] transition-[box-shadow] duration-300 ease-out",
        STATUS_RING[status],
        className,
      )}
      style={{ width: size, height: size }}
      title={t(`status.${status}`)}
    >
      <Image
        src="/images/chibi-avatar-64x64.png"
        alt={tLayout("avatarAlt")}
        width={64}
        height={64}
        className="size-full rounded-full object-cover"
        priority
      />
      <span className="sr-only">{t(`status.${status}`)}</span>
    </span>
  );
}
