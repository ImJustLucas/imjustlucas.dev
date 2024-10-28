import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "react-use-lanyard";
import { TypographyMuted } from "../typography";

type PresenceActivityProps = {
  currentActivity: Activity | undefined;
};

export const PresenceActivity = ({
  currentActivity,
}: PresenceActivityProps) => {
  if (!currentActivity) return null;

  return (
    <Card className="w-full cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {currentActivity.assets && (
            <div className="relative h-12 w-12">
              <Image
                src={`https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${currentActivity.assets.large_image}.png`}
                alt={currentActivity.name}
                width={48}
                height={48}
                className="rounded-md"
              />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border-2 border-background">
                <Image
                  src={`https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${currentActivity.assets.small_image}.png`}
                  alt="Secondary activity"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <h5 className="font-medium text-primary">{currentActivity.name}</h5>
            {currentActivity.details && (
              <TypographyMuted>{currentActivity.details}</TypographyMuted>
            )}
            {currentActivity.state && (
              <TypographyMuted>{currentActivity.state}</TypographyMuted>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
