"use client";

import { useLanyard } from "react-use-lanyard";

import { PresenceActivity } from "./PresenceActivity";
import { PresenceListening } from "./PresenceListening";
import { selectPresence } from "./select-presence";

type PresenceBlockProps = {
  /** The Profile's Discord account. */
  discordUserId: string;
};

export const PresenceBlock = ({ discordUserId }: PresenceBlockProps) => {
  const { status } = useLanyard({
    userId: discordUserId,
    socket: true,
  });

  const presence = selectPresence(status);
  if (presence.kind === "nothing") return null;

  return (
    <div className="pb-4">
      {presence.kind === "playing" && <PresenceActivity presence={presence} />}
      {presence.kind === "listening" && (
        <PresenceListening presence={presence} />
      )}
    </div>
  );
};
