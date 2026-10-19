"use client";

import { useLanyard } from "react-use-lanyard";

import { PresenceActivity } from "./PresenceActivity";
import { PresenceListening } from "./PresenceListening";
import { selectPresence } from "./select-presence";

export const PresenceBlock = () => {
  const { status } = useLanyard({
    userId: "127063570616811520",
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
