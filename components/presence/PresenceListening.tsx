"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";

import { Bold, TypographyMuted } from "../typography";
import type { Presence } from "./select-presence";

type PresenceListeningProps = {
  presence: Extract<Presence, { kind: "listening" }>;
};

export const PresenceListening = ({ presence }: PresenceListeningProps) => {
  const { song, artist, artwork } = presence;
  const t = useTranslations("Presence");

  return (
    <Card className="w-full cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-12 w-12 shrink-0">
            {artwork ? (
              <Image
                src={artwork.url}
                alt={artwork.alt}
                width={48}
                height={48}
                className="rounded-md"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-muted" />
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border-2 border-background bg-black">
              <Image
                src="/images/spotify-logo.png"
                alt={t("spotifyLogo")}
                width={20}
                height={20}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Bold className="block font-medium text-primary">{song}</Bold>
            <TypographyMuted>{t("listeningBy", { artist })}</TypographyMuted>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
