"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { Menu, X } from "lucide-react";

import { ChibiHead } from "@/components/chibi/ChibiHead";
import { useSounds } from "@/components/sound/SoundProvider";
import { SoundSwitch } from "@/components/sound/SoundSwitch";
import { TypographyTitle } from "@/components/typography";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { Link } from "@/i18n/navigation";

/**
 * The mobile top bar (below 768px): the chibi head in its status ring, the
 * handle, the sound switch and the button of the client sheet. It stays
 * above the sheet, so the same button closes it.
 */
export function MobileTopBar() {
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();
  const { play } = useSounds();
  const t = useTranslations("Sidebar");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // While the sheet is open, Escape closes it, and so does widening the
  // window to the desktop layout, where the content panel must not stay inert.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => desktop.matches && closeMenu();
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [isOpen, closeMenu]);

  // Focus goes back to the toggle when the sheet closes, whatever closed it.
  useEffect(() => {
    if (wasOpen.current && !isOpen) toggleRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 rounded-xl bg-ground pl-2 pr-1.5 md:hidden">
      <Link
        href="/"
        onClick={() => closeMenu()}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md"
      >
        <ChibiHead size={40} />
        <TypographyTitle as="span" className="truncate">
          ImJustLucas
        </TypographyTitle>
      </Link>
      <SoundSwitch />
      {/* First in the tab order before the sheet, so Tab moves into it */}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => {
          play(isOpen ? "toggleOff" : "toggleOn");
          toggleMenu();
        }}
        aria-expanded={isOpen}
        aria-controls="sidebar"
        className="ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-raised text-ink"
      >
        {isOpen ? (
          <X aria-hidden className="size-5" />
        ) : (
          <Menu aria-hidden className="size-5" />
        )}
        <span className="sr-only">
          {isOpen ? t("closeMenu") : t("openMenu")}
        </span>
      </button>
    </header>
  );
}
