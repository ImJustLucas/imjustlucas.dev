"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Check, Github, Instagram, Linkedin, Youtube } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { PresenceCard } from "@/components/presence/FriendsPanel";
import { usePresence } from "@/components/presence/PresenceProvider";
import { STATUS_DOT, STATUS_RING } from "@/components/presence/status-style";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyTag, TypographyTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { PlayerLevel, Profile } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** How long the Play button says LinkedIn is open. */
const OPENED_FOR_MS = 2400;

type FriendRequestProps = {
  links: Profile["links"];
  discordUserId: Profile["discordUserId"];
  /** Lucas's Level, shown beside his name; none when GitHub is unread. */
  level?: Pick<PlayerLevel, "level" | "xp">;
};

/**
 * The add-friend screen: Lucas's card with his live status, the LinkedIn DM
 * as the one Play action, his Discord profile, the other platforms, and
 * what he is doing right now.
 */
export function FriendRequest({
  links,
  discordUserId,
  level,
}: FriendRequestProps) {
  const t = useTranslations("Contact");
  const tPresence = useTranslations("Presence");
  const tSidebar = useTranslations("Sidebar");
  const tLevel = useTranslations("Home.level");
  const { presence, status } = usePresence();
  const { play } = useSounds();
  // Nothing is sent from here: the button only opens LinkedIn, and says so.
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const timer = window.setTimeout(() => setOpened(false), OPENED_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [opened]);

  const others = [
    { icon: Github, href: links.github, label: "GitHub" },
    { icon: Youtube, href: links.youtube, label: "YouTube" },
    { icon: Instagram, href: links.instagram, label: "Instagram" },
  ];

  return (
    <div className="flex flex-col gap-section">
      <section
        aria-labelledby="request-name"
        className="tray grid gap-x-8 gap-y-6 rounded-lg border-2 border-seam bg-raised p-4 sm:p-6 md:grid-cols-[240px_1fr] md:px-7 md:py-6"
      >
        {/* Lucas waving, on his stage disc ringed in his live status */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-36 shrink-0 md:w-full">
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground ring-4 transition-[box-shadow] duration-300 ease-out",
                STATUS_RING[status],
              )}
            />
            <ChibiSprite
              pose="banner"
              alt={t("chibiAlt")}
              sizes="(min-width: 768px) 240px, 144px"
              priority
              className="aspect-square w-full"
            />
          </div>
          {/* The live tag, in the status colour */}
          <TypographyTag
            className={cn(
              "rounded-full px-2.5 py-0.5",
              STATUS_DOT[status],
              status === "connecting" ? "text-ink" : "text-on-bright",
            )}
          >
            {tPresence(`status.${status}`)}
          </TypographyTag>
        </div>

        <div className="flex min-w-0 flex-col gap-5 md:self-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <TypographyTitle
                as="h2"
                id="request-name"
                className="text-[1.375rem] leading-tight"
              >
                ImJustLucas
              </TypographyTitle>
              {/* His Level, as a friend request shows a player's */}
              {level && (
                <span
                  title={tLevel("rule", { xp: level.xp })}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border-2 border-seam bg-ground pl-2.5 pr-3"
                >
                  <TypographyTag className="leading-none text-ink-muted">
                    <span aria-hidden>{tLevel("badge")}</span>
                    <span className="sr-only">
                      {tLevel("badgeLabel", { level: level.level })}
                    </span>
                  </TypographyTag>
                  <TypographyTitle
                    as="span"
                    className="leading-none tabular-nums"
                  >
                    <span aria-hidden>{level.level}</span>
                  </TypographyTitle>
                </span>
              )}
            </div>
            <span className="text-label text-ink-muted">
              {tSidebar("playerLine")}
            </span>
          </div>

          <div className="flex flex-col items-stretch gap-4">
            <div className="flex flex-col gap-2 sm:items-start lg:flex-row lg:items-center lg:gap-3">
              <Button
                asChild
                variant="play"
                size="lg"
                className="h-auto min-h-[52px] w-full whitespace-normal py-3 text-center sm:w-auto"
              >
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    play("confirm");
                    setOpened(true);
                  }}
                >
                  {opened ? (
                    <Check aria-hidden className="!size-5" />
                  ) : (
                    <Linkedin aria-hidden className="!size-5" />
                  )}
                  {opened ? t("opened") : t("dm")}
                </a>
              </Button>
              <span className="pl-1 text-label text-ink-muted">
                {t("reply")}
              </span>
            </div>
            <SoundOnPress>
              <Button asChild variant="outline" className="self-start">
                <a
                  href={`https://discord.com/users/${discordUserId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DiscordMark />
                  {t("discord")}
                </a>
              </Button>
            </SoundOnPress>
          </div>
          {/* LinkedIn, once opened, said aloud */}
          <span aria-live="polite" className="sr-only">
            {opened ? t("openedAnnounced") : ""}
          </span>

          <div className="flex flex-col gap-3 border-t-2 border-seam pt-5 sm:flex-row sm:items-center sm:gap-4">
            <span className="whitespace-nowrap text-label text-ink-muted">
              {t("alsoOn")}
            </span>
            <ul className="flex flex-wrap gap-2">
              {others.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <SoundOnPress>
                    <Button asChild variant="outline" className="px-3">
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        <Icon aria-hidden />
                        {label}
                      </a>
                    </Button>
                  </SoundOnPress>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Every presence state, at the friends panel's fixed height, so the
          centred window never moves when Lucas starts or stops a game */}
      <section aria-labelledby="right-now" className="flex flex-col gap-3">
        <TypographyTitle as="h2" id="right-now">
          {t("rightNow")}
        </TypographyTitle>
        <div className="tray flex h-[76px] items-center gap-3 overflow-hidden rounded-lg bg-raised p-3">
          <PresenceCard presence={presence} />
        </div>
      </section>
    </div>
  );
}

/**
 * Discord's mark, drawn in 1.75px strokes so it sits with the lucide marks
 * of the other platforms.
 */
function DiscordMark() {
  return (
    <svg
      aria-hidden
      viewBox="-1 -1 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinejoin="round"
    >
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.1.246.198.373.292a.077.077 0 0 1-.007.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}
