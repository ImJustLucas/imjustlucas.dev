"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLanyard } from "react-use-lanyard";

import {
  type DiscordStatus,
  type Presence,
  presenceStatus,
  selectPresence,
} from "./select-presence";

/** How long the first live status may take before Lucas shows offline. */
const UNREACHABLE_AFTER_MS = 10_000;

type PresenceContextValue = {
  presence: Presence;
  status: DiscordStatus | "connecting";
};

const PresenceContext = createContext<PresenceContextValue | undefined>(
  undefined,
);

/**
 * The one Lanyard connection of the client, shared by the player card, the
 * mobile top bar and the friends panel. Presence never plays a sound.
 */
export function PresenceProvider({
  discordUserId,
  children,
}: {
  /** The Profile's Discord account. */
  discordUserId: string;
  children: React.ReactNode;
}) {
  const { status } = useLanyard({ userId: discordUserId, socket: true });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setTimedOut(true),
      UNREACHABLE_AFTER_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const unreachable = !status && timedOut;
  const value = {
    presence: selectPresence(status, { unreachable }),
    status: presenceStatus(status, { unreachable }),
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
}
