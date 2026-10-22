"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { ScrollText } from "lucide-react";

import {
  readSeenPatch,
  subscribeSeenPatch,
} from "@/components/patch-notes/patch-seen";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyData } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { Link, usePathname } from "@/i18n/navigation";
import { isActiveRoute } from "@/lib/routes/is-active-route";
import { cn } from "@/lib/utils";

/**
 * The client's version, at the foot of the sidebar: a quiet link to the
 * patch notes that plays the patch chime, with an Online dot until the
 * visitor has read the current version's notes.
 */
export function VersionLink({ version }: { version: string }) {
  const t = useTranslations("Sidebar");
  const tRoutes = useTranslations("Routes");
  const { play } = useSounds();
  const { closeMenu } = useMobileMenu();
  const pathname = usePathname();
  // Read after hydration; the server and first render show it as read
  const seen = useSyncExternalStore(
    subscribeSeenPatch,
    readSeenPatch,
    () => version,
  );
  const unread = seen !== version;
  const active = isActiveRoute(ROUTES.patchNotes.path, pathname);

  return (
    <Link
      href={ROUTES.patchNotes.path}
      aria-current={active ? "page" : undefined}
      onPointerEnter={() => play("tick")}
      onClick={() => {
        play("patch");
        closeMenu();
      }}
      className={cn(
        "group -mx-1 inline-flex h-11 items-center gap-2 self-start rounded-md px-1 text-label transition-colors duration-hover ease-out hover:text-ink",
        active ? "text-ink" : "text-ink-muted",
      )}
    >
      <ScrollText aria-hidden className="size-4" />
      <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-hover group-hover:decoration-link-line">
        {tRoutes("patchNotes.label")}
      </span>{" "}
      <TypographyData>v{version}</TypographyData>
      {unread && (
        <>
          <span
            aria-hidden
            className="size-2 rounded-full bg-online motion-safe:animate-breathe"
          />
          <span className="sr-only"> · {t("unread")}</span>
        </>
      )}
    </Link>
  );
}
