"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import {
  ArrowUpRight,
  Award,
  Backpack,
  Check,
  Clapperboard,
  Download,
  Gamepad2,
  Github,
  Hand,
  History,
  Languages,
  Link2,
  Linkedin,
  type LucideIcon,
  MessageCircleHeart,
  Monitor,
  Moon,
  ScrollText,
  Sun,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { DiscordMark } from "@/components/contact/DiscordMark";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { usePalette } from "@/components/palette/use-palette";
import { usePoke } from "@/components/poke/PokeProvider";
import { RarityTag } from "@/components/rarity/RarityTag";
import { useSounds } from "@/components/sound/SoundProvider";
import { Sparkle } from "@/components/sparkle";
import { countTrophyStep } from "@/components/trophies/trophy-store";
import {
  TypographyData,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ARCADE_OPEN_EVENT, CABINETS } from "@/lib/arcade/cabinets";
import type { Profile, ProjectEntry } from "@/lib/content/types";
import { PALETTE_SWATCH } from "@/lib/palette";
import {
  type Action,
  buildCommands,
  type Command as QuickCommand,
  type CommandTexts,
  filterCommands,
  groupBySection,
  type Mode,
  type Secret,
  SECRET_SHOW,
} from "@/lib/quick-menu/commands";
import { cn } from "@/lib/utils";

import { Keycap, useModifierKey } from "./QuickMenuTrigger";

/** What the layout hands the quick menu: the Projects and the Profile. */
export type QuickMenuData = {
  readonly projects: ReadonlyArray<ProjectEntry>;
  readonly profile: Pick<Profile, "links" | "discordUserId" | "resumes">;
};

/** A small window over the client's corner: a secret found, a link copied. */
export type Toast =
  | { readonly kind: "secret"; readonly secret: Secret }
  | { readonly kind: "copied" | "copyFailed" };

/** The toast on screen; a new id is a new toast, even for the same secret. */
export type ShownToast = { readonly toast: Toast; readonly id: number };

type QuickMenuLayerProps = {
  data: QuickMenuData;
  open: boolean;
  /** `silent` after a command ran: it plays its own note. */
  onOpenChange: (open: boolean, silent?: boolean) => void;
  toast: ShownToast | null;
  onToast: (toast: Toast | null) => void;
};

// The other Locale's texts, fetched with the menu so a search finds both
const DICTIONARIES: Record<Locale, () => Promise<{ default: CommandTexts }>> = {
  en: () => import("@/messages/en.json"),
  fr: () => import("@/messages/fr.json"),
};

const PAGE_ICONS: Record<string, LucideIcon> = {
  [ROUTES.me.path]: UserRound,
  [ROUTES.what.path]: Backpack,
  [ROUTES.experiences.path]: History,
  [ROUTES.videos.path]: Clapperboard,
  [ROUTES.arcade.path]: Gamepad2,
  [ROUTES.contact.path]: MessageCircleHeart,
  [ROUTES.mdf2025.path]: Trophy,
  [ROUTES.patchNotes.path]: ScrollText,
  [ROUTES.trophies.path]: Award,
};

const CHOSEN_ROW = "[cmdk-item][aria-selected=true]";

const MODE_ICONS: Record<Mode, LucideIcon> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

/**
 * The quick menu's chunk: the menu window and the toasts, loaded on first
 * use by `QuickMenuProvider`.
 */
export default function QuickMenuLayer({
  data,
  open,
  onOpenChange,
  toast,
  onToast,
}: QuickMenuLayerProps) {
  return (
    <>
      <QuickMenu
        data={data}
        open={open}
        onOpenChange={onOpenChange}
        onToast={onToast}
      />
      {toast && (
        <SecretToast key={toast.id} toast={toast.toast} onToast={onToast} />
      )}
    </>
  );
}

/** The menu window: its body mounts afresh, with an empty field, each time. */
function QuickMenu({
  data,
  open,
  onOpenChange,
  onToast,
}: Omit<QuickMenuLayerProps, "toast">) {
  const locale = useLocale();
  const t = useTranslations("QuickMenu");
  const [other, setOther] = useState<CommandTexts | null>(null);

  const otherLocale: Locale = locale === "en" ? "fr" : "en";
  useEffect(() => {
    let current = true;
    DICTIONARIES[otherLocale]()
      .then((module) => current && setOther(module.default))
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [otherLocale]);

  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent
        // The field takes focus as the menu opens
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLInputElement>("[cmdk-input]")
            ?.focus();
        }}
        className="inset-x-3 top-3 mx-auto flex max-h-[calc(100dvh-24px)] max-w-[640px] flex-col overflow-hidden motion-safe:animate-window-in motion-reduce:animate-fade-in md:top-[12vh] md:max-h-[76vh]"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <QuickMenuBody
          data={data}
          other={other}
          otherLocale={otherLocale}
          onOpenChange={onOpenChange}
          onToast={onToast}
        />
      </DialogContent>
    </Dialog>
  );
}

function QuickMenuBody({
  data,
  other,
  otherLocale,
  onOpenChange,
  onToast,
}: Pick<QuickMenuLayerProps, "data" | "onOpenChange" | "onToast"> & {
  other: CommandTexts | null;
  otherLocale: Locale;
}) {
  const locale = useLocale();
  const messages = useMessages() as unknown as CommandTexts;
  const t = useTranslations("QuickMenu");
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const { state: sound, play, toggle } = useSounds();
  const { closeMenu } = useMobileMenu();
  const poke = usePoke();
  const reducedMotion = useReducedMotion();
  const modifier = useModifierKey();
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);

  // cmdk reads the chosen row from the DOM before the rows re-render, so its
  // `aria-activedescendant` lags one step behind (none at all after a new
  // query); keep it on the chosen row for screen readers
  useEffect(() => {
    const element = root.current;
    const input = element?.querySelector("[cmdk-input]");
    if (!element || !input) return;
    const sync = () => {
      const id = element.querySelector(CHOSEN_ROW)?.id;
      if (id && input.getAttribute("aria-activedescendant") !== id) {
        input.setAttribute("aria-activedescendant", id);
      } else if (!id) {
        input.removeAttribute("aria-activedescendant");
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-selected", "aria-activedescendant"],
    });
    sync();
    return () => observer.disconnect();
  }, []);

  const commands = useMemo(
    () =>
      buildCommands({
        locale,
        texts: { [locale]: messages, ...(other && { [otherLocale]: other }) },
        projects: data.projects,
        links: {
          linkedin: data.profile.links.linkedin,
          github: data.profile.links.github,
          discord: `https://discord.com/users/${data.profile.discordUserId}`,
          resume: data.profile.resumes[locale].asset,
        },
        poke: poke.enabled,
        state: {
          palette,
          mode: theme as Mode | undefined,
          sound: sound.enabled,
        },
      }),
    [
      locale,
      messages,
      other,
      otherLocale,
      data,
      poke.enabled,
      palette,
      theme,
      sound.enabled,
    ],
  );
  const results = useMemo(
    () => filterCommands(commands, query),
    [commands, query],
  );
  const groups = groupBySection(results);

  const run = (command: QuickCommand) => {
    onOpenChange(false, true);
    if (command.cue) {
      play(
        command.cue,
        command.tab === undefined ? undefined : { tab: command.tab },
      );
    }
    perform(command.action);
  };

  const perform = (action: Action) => {
    switch (action.kind) {
      case "navigate":
        closeMenu();
        router.push(action.href);
        return;
      case "arcade": {
        closeMenu();
        // Already on the floor: open the cabinet in place
        if (pathname === ROUTES.arcade.path) {
          window.dispatchEvent(
            new CustomEvent(ARCADE_OPEN_EVENT, { detail: action.cabinet }),
          );
          return;
        }
        router.push(
          action.cabinet === CABINETS[0].id
            ? ROUTES.arcade.path
            : {
                pathname: ROUTES.arcade.path,
                query: { cabinet: action.cabinet },
              },
        );
        return;
      }
      case "palette":
        setPalette(action.palette);
        return;
      case "mode":
        setTheme(action.mode);
        return;
      case "locale":
        router.replace(pathname, { locale: action.locale });
        return;
      case "sound":
        toggle();
        return;
      case "copyLink":
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => onToast({ kind: "copied" }))
          .catch(() => onToast({ kind: "copyFailed" }));
        return;
      case "external":
        window.open(action.href, "_blank", "noopener,noreferrer");
        return;
      case "download": {
        const link = document.createElement("a");
        link.href = action.href;
        link.download = "";
        link.click();
        return;
      }
      case "poke":
        poke.send("wave", { toast: true });
        return;
      case "secret":
        countTrophyStep("secrets", action.secret);
        if (action.secret === "barrelRoll" && !reducedMotion) {
          document
            .querySelector("[data-client-window]")
            ?.animate(
              [{ transform: "rotate(0turn)" }, { transform: "rotate(1turn)" }],
              { duration: 1100, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
            );
          return;
        }
        onToast({ kind: "secret", secret: action.secret });
        if (action.secret === "hire") {
          closeMenu();
          window.setTimeout(() => router.push(ROUTES.contact.path), 900);
        }
        return;
    }
  };

  return (
    <Command
      ref={root}
      shouldFilter={false}
      loop
      label={t("title")}
      onKeyDown={(event) => {
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          play("tick");
        }
      }}
      className="min-h-0"
    >
      <div className="flex items-center gap-2 p-3">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t("placeholder")}
          aria-label={t("title")}
        />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={t("close")}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "md:hidden [&_svg]:size-5",
          )}
        >
          <X aria-hidden />
        </button>
      </div>
      <CommandList className="min-h-0 flex-1 px-3 pb-3 [scroll-padding-block:12px]">
        {groups.map(({ section, commands }) => (
          <CommandGroup key={section} heading={t(`sections.${section}`)}>
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                value={command.id}
                onSelect={() => run(command)}
                onPointerEnter={() => play("tick")}
              >
                <CommandIcon command={command} sound={sound.enabled} />
                <span className="min-w-0 flex-1 truncate">{command.label}</span>
                <CommandDetail
                  command={command}
                  locale={otherLocale}
                  currentLabel={t("current")}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {results.length === 0 && <Empty />}
      </CommandList>
      {/* Keyboards only: on touch the rows are pressed */}
      <div className="flex items-center gap-4 border-t-2 border-seam px-4 py-2.5 text-ink-muted [@media(pointer:coarse)]:hidden">
        <Hint keys={["↑", "↓"]} label={t("hints.move")} />
        <Hint keys={["↵"]} label={t("hints.select")} />
        <Hint keys={["esc"]} label={t("hints.close")} />
        {modifier && (
          <span className="ml-auto">
            <Keys keys={[modifier, "K"]} />
          </span>
        )}
      </div>
      <div aria-live="polite" className="sr-only">
        {query ? t("results", { count: results.length }) : ""}
      </div>
    </Command>
  );
}

function CommandIcon({
  command,
  sound,
}: {
  command: QuickCommand;
  sound: boolean;
}) {
  const { action } = command;
  const className = "size-[18px]";
  switch (action.kind) {
    case "navigate": {
      const Icon =
        command.section === "projects"
          ? Backpack
          : (PAGE_ICONS[action.href] ?? UserRound);
      return <Icon aria-hidden className={className} />;
    }
    case "arcade":
      return <Gamepad2 aria-hidden className={className} />;
    case "palette":
      return (
        <span
          aria-hidden
          className="mx-0.5 size-3.5 shrink-0 rounded-full ring-2 ring-seam group-data-[selected=true]/item:ring-on-action/40"
          style={{ backgroundColor: PALETTE_SWATCH[action.palette] }}
        />
      );
    case "mode": {
      const Icon = MODE_ICONS[action.mode];
      return <Icon aria-hidden className={className} />;
    }
    case "locale":
      return <Languages aria-hidden className={className} />;
    case "sound":
      return sound ? (
        <VolumeX aria-hidden className={className} />
      ) : (
        <Volume2 aria-hidden className={className} />
      );
    case "copyLink":
      return <Link2 aria-hidden className={className} />;
    case "external": {
      if (command.id === "link-discord") {
        return <DiscordMark className={className} />;
      }
      const Icon = command.id === "link-github" ? Github : Linkedin;
      return <Icon aria-hidden className={className} />;
    }
    case "download":
      return <Download aria-hidden className={className} />;
    case "poke":
      return <Hand aria-hidden className={className} />;
    case "secret":
      return <Sparkle className={className} />;
  }
}

/** What sits at the row's right: a check, a rarity, a Locale, an exit. */
function CommandDetail({
  command,
  locale,
  currentLabel,
}: {
  command: QuickCommand;
  locale: Locale;
  currentLabel: string;
}) {
  if (command.current) {
    return (
      <span className="flex items-center gap-1.5 text-tag text-action-ink group-data-[selected=true]/item:text-on-action">
        <Check aria-hidden className="size-4" />
        <span className="sr-only">{currentLabel}</span>
      </span>
    );
  }
  if (command.rarity) return <RarityTag rarity={command.rarity} />;
  if (command.action.kind === "locale") {
    return (
      <TypographyData className="uppercase text-ink-muted group-data-[selected=true]/item:text-on-action">
        {locale}
      </TypographyData>
    );
  }
  if (command.action.kind === "external") {
    return (
      <ArrowUpRight
        aria-hidden
        className="size-4 text-ink-muted group-data-[selected=true]/item:text-on-action"
      />
    );
  }
  return null;
}

function Keys({ keys }: { keys: ReadonlyArray<string> }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((key) => (
        <Keycap key={key}>{key}</Keycap>
      ))}
    </span>
  );
}

function Hint({ keys, label }: { keys: ReadonlyArray<string>; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-label text-ink-muted">
      <Keys keys={keys} />
      {label}
    </span>
  );
}

function Empty() {
  const t = useTranslations("QuickMenu");
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-ground">
        <ChibiSprite
          pose="chilling"
          alt={t("emptyAlt")}
          sizes="72px"
          className="size-[72px]"
        />
      </span>
      <TypographyMuted className="max-w-[34ch] text-pretty">
        {t("empty")}
      </TypographyMuted>
    </div>
  );
}

const TOAST_MS = 4200;

/**
 * A secret found or a link copied: a raised window in the client's corner
 * (bottom, full width on phones), the pose on its stage disc beside a
 * Title and a muted line. It rises in, stays 4.2 seconds, and is announced
 * politely; pressing it dismisses it.
 */
function SecretToast({
  toast,
  onToast,
}: {
  toast: Toast;
  onToast: (toast: Toast | null) => void;
}) {
  const t = useTranslations("QuickMenu");
  const done = () => onToast(null);

  useEffect(() => {
    const timer = window.setTimeout(() => onToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [onToast]);

  const text =
    toast.kind === "secret"
      ? {
          title: t(`secrets.${toast.secret}.title`),
          line: t(`secrets.${toast.secret}.line`),
          pose: SECRET_SHOW[toast.secret].pose,
          alt: t(`secrets.${toast.secret}.alt`),
        }
      : {
          title: t(`${toast.kind}.title`),
          line: t(`${toast.kind}.line`),
          pose: null,
          alt: "",
        };

  return (
    <div
      role="status"
      onClick={done}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-sm cursor-pointer items-center gap-3 rounded-lg border-2 border-seam bg-raised p-3 pr-4 text-ink shadow-[var(--float),var(--tray)] motion-safe:animate-window-in motion-reduce:animate-fade-in md:inset-x-auto md:bottom-6 md:right-6"
    >
      {text.pose ? (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-ground">
          <ChibiSprite
            pose={text.pose}
            alt={text.alt}
            sizes="64px"
            className="size-16"
          />
        </span>
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ground text-action-ink">
          {toast.kind === "copied" ? (
            <Check aria-hidden className="size-5" />
          ) : (
            <X aria-hidden className="size-5" />
          )}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        {toast.kind === "secret" && toast.secret === "konami" && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-online px-2 py-0.5 text-tag text-on-bright">
            <Check aria-hidden className="size-3" />
            {t("unlocked")}
          </span>
        )}
        <TypographyTitle as="span" className="text-pretty">
          {text.title}
        </TypographyTitle>
        <span className="text-pretty text-label text-ink-muted">
          {text.line}
        </span>
      </span>
    </div>
  );
}
