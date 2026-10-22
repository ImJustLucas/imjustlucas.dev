import type { Activity } from "react-use-lanyard";

import type { PresenceImage } from "./select-presence";

const MEDIA_PROXY_PREFIX = "mp:";

const activityImageUrl = (activity: Activity, image: string | undefined) => {
  if (!image) return undefined;
  if (image.startsWith(MEDIA_PROXY_PREFIX)) {
    return `https://media.discordapp.net/${image.slice(MEDIA_PROXY_PREFIX.length)}`;
  }
  if (!activity.application_id) return undefined;
  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
};

/** An activity's image, described by `alt` (its caption or name by default). */
export const activityImage = (
  activity: Activity,
  image: string | undefined,
  alt: string | undefined,
): PresenceImage | undefined => {
  const url = activityImageUrl(activity, image);
  return url ? { url, alt: alt || activity.name } : undefined;
};
