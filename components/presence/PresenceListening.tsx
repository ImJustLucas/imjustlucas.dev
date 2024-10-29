import React from "react";
import { Spotify } from "react-use-lanyard";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

import { TypographyMuted } from "../typography";

type PresenceListeningProps = {
  spotify: Spotify | undefined;
};

export const PresenceListening = ({ spotify }: PresenceListeningProps) => {
  if (!spotify) return null;

  return (
    <Card className="w-full cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-12 w-12">
            <Image
              src={spotify.album_art_url}
              alt={spotify.song}
              width={48}
              height={48}
              className="rounded-md"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border-2 border-background bg-black">
              <Image
                src="/images/spotify-logo.png"
                alt="Spotify Logo"
                width={20}
                height={20}
              />
            </div>
          </div>
          <div className="space-y-1">
            <h5 className="font-medium text-primary">{spotify.song}</h5>
            <TypographyMuted>by {spotify.artist}</TypographyMuted>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
