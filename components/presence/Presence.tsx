import { useEffect, useMemo, useState } from "react";
import { useLanyard } from "react-use-lanyard";

import { PresenceActivity } from "./PresenceActivity";
import { PresenceListening } from "./PresenceListening";

type PresenceProps = "activity" | "listening" | "custom";

export const PresenceBlock = () => {
  const [presence, setPresence] = useState<PresenceProps>();
  const { status /*, websocket */ } = useLanyard({
    userId: "127063570616811520",
    socket: true,
  });

  const currentActivity = useMemo(
    () => status?.activities?.filter((activity) => activity.type === 0)[0],
    [status],
  );

  useEffect(() => {
    if (currentActivity) {
      setPresence("activity");
    } else if (status?.listening_to_spotify) {
      setPresence("listening");
    }
  }, [status, currentActivity]);

  return (
    <div className="pb-4">
      {presence === "activity" && (
        <PresenceActivity currentActivity={currentActivity} />
      )}
      {presence === "listening" && (
        <PresenceListening spotify={status?.spotify} />
      )}
    </div>
  );
};
