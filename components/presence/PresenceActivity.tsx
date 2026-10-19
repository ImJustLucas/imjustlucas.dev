"use client";

import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

import { TypographyMuted } from "../typography";
import type { Presence } from "./select-presence";

type PresenceActivityProps = {
  presence: Extract<Presence, { kind: "playing" }>;
};

export const PresenceActivity = ({ presence }: PresenceActivityProps) => {
  const { name, details, state, artwork, badge } = presence;

  return (
    <Card className="w-full cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {artwork && (
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={artwork.url}
                alt={artwork.alt}
                width={48}
                height={48}
                className="rounded-md"
              />
              {badge && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border-2 border-background">
                  <Image
                    src={badge.url}
                    alt={badge.alt}
                    width={20}
                    height={20}
                  />
                </div>
              )}
            </div>
          )}
          <div className="space-y-1">
            <h5 className="font-medium text-primary">{name}</h5>
            {details && <TypographyMuted>{details}</TypographyMuted>}
            {state && <TypographyMuted>{state}</TypographyMuted>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
