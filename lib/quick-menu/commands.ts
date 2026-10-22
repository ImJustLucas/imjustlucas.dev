import { MENU_ROUTES, projectPath, ROUTES } from "@/config/routes";
import type { Locale } from "@/i18n/routing";
import { type CabinetId, CABINETS } from "@/lib/arcade/cabinets";
import type { ChibiPose } from "@/lib/chibi";
import type { Rarity } from "@/lib/content/types";
import { type Palette, PALETTES } from "@/lib/palette";
import type { Cue } from "@/lib/sound/kit";
import type messages from "@/messages/en.json";

/**
 * The quick menu's commands (DESIGN.md, Quick menu): plain data built from
 * the Routes, the Projects, the Arcade's cabinets, the palettes and the
 * Profile's links. Each command is labelled in the visitor's Locale and
 * answers to words of both Locales, so "projets" finds "what i've done" on
 * the English site. `components/quick-menu` runs them.
 */

export type Section =
  | "secrets"
  | "pages"
  | "projects"
  | "arcade"
  | "settings"
  | "links";

export type Mode = "dark" | "light" | "system";
export const MODES: ReadonlyArray<Mode> = ["dark", "light", "system"];

/** The easter eggs, found only by typing their words (or the Konami code). */
export type Secret =
  | "konami"
  | "barrelRoll"
  | "coffee"
  | "sleep"
  | "gg"
  | "hire";

export type Action =
  | { readonly kind: "navigate"; readonly href: string }
  | { readonly kind: "arcade"; readonly cabinet: CabinetId }
  | { readonly kind: "palette"; readonly palette: Palette }
  | { readonly kind: "mode"; readonly mode: Mode }
  | { readonly kind: "locale"; readonly locale: Locale }
  | { readonly kind: "sound" }
  | { readonly kind: "copyLink" }
  | { readonly kind: "external"; readonly href: string }
  | { readonly kind: "download"; readonly href: string }
  /** Waves at Lucas on Discord, with the hello emote. */
  | { readonly kind: "poke" }
  | { readonly kind: "secret"; readonly secret: Secret };

export type Command = {
  /** Unique, stable across Locales. */
  readonly id: string;
  readonly section: Section;
  /** In the visitor's Locale. */
  readonly label: string;
  /** What the command answers to besides its label, normalized. */
  readonly terms: ReadonlyArray<string>;
  readonly action: Action;
  /** The note it plays when chosen (the sound switch plays its own). */
  readonly cue: Cue | null;
  /** For a page in the menu, its tab's place, so it plays the tab's note. */
  readonly tab?: number;
  /** The visitor's current choice (a palette, a mode). */
  readonly current?: boolean;
  /** A Project's rarity, shown as its tag. */
  readonly rarity?: Rarity;
};

/** The texts the commands are built from, in one Locale. */
export type CommandTexts = Pick<
  typeof messages,
  "Routes" | "QuickMenu" | "ThemeSwitch" | "Arcade"
>;

export type CommandsInput = {
  readonly locale: Locale;
  /** The visitor's Locale's texts and, once loaded, the other's. */
  readonly texts: Partial<Record<Locale, CommandTexts>>;
  readonly projects: ReadonlyArray<{
    readonly slug: string;
    readonly title: string;
    readonly rarity: Rarity;
  }>;
  readonly links: {
    readonly linkedin: string;
    readonly github: string;
    readonly discord: string;
    readonly resume: string;
  };
  /** Whether visitors can wave at Lucas (DESIGN.md, Wave). */
  readonly poke?: boolean;
  readonly state: {
    readonly palette: Palette;
    readonly mode: Mode | undefined;
    readonly sound: boolean;
  };
};

/**
 * The words that reveal each secret: typed whole, or at least their first
 * three letters (both letters of "gg").
 */
export const SECRET_WORDS: { readonly [S in Secret]: ReadonlyArray<string> } = {
  konami: ["konami", "up up down down", "haut haut bas bas"],
  barrelRoll: ["do a barrel roll", "barrel roll", "fais un tonneau"],
  coffee: ["coffee", "cafe", "brb"],
  sleep: ["sleep", "nap", "zzz", "dodo", "sieste"],
  gg: ["gg", "gg wp", "ggwp"],
  hire: ["sudo hire lucas", "sudo", "hire me", "hire lucas", "embauche"],
};

/** What each secret shows in its toast, and the note it plays. */
export const SECRET_SHOW: {
  readonly [S in Secret]: { readonly pose: ChibiPose; readonly cue: Cue };
} = {
  konami: { pose: "ollie", cue: "unlock" },
  barrelRoll: { pose: "lol", cue: "boop" },
  coffee: { pose: "coffee", cue: "boop" },
  sleep: { pose: "sleeping", cue: "boop" },
  gg: { pose: "trophy", cue: "unlock" },
  hire: { pose: "banner", cue: "unlock" },
};

const SECRETS = Object.keys(SECRET_WORDS) as ReadonlyArray<Secret>;

/** Lowercase, without accents or punctuation, single-spaced. */
export const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const words = (text: string | undefined) =>
  text === undefined ? [] : [normalize(text)];

const fill = (template: string, name: string) =>
  template.replace("{name}", name);

/** Every Locale's version of a text, the visitor's first, normalized. */
const inEvery = (
  input: CommandsInput,
  pick: (texts: CommandTexts) => string,
): ReadonlyArray<string> =>
  [input.locale, ...(Object.keys(input.texts) as Locale[])]
    .filter((locale, i, all) => all.indexOf(locale) === i)
    .flatMap((locale) => {
      const texts = input.texts[locale];
      return texts ? words(pick(texts)) : [];
    });

/** Every command, in section order, secrets included. */
export const buildCommands = (input: CommandsInput): Command[] => {
  const texts = input.texts[input.locale];
  if (!texts) return [];
  const every = (pick: (texts: CommandTexts) => string) => inEvery(input, pick);
  const { state } = input;

  const secrets = SECRETS.map(
    (secret): Command => ({
      id: `secret-${secret}`,
      section: "secrets",
      label: texts.QuickMenu.secrets[secret].label,
      terms: SECRET_WORDS[secret],
      action: { kind: "secret", secret },
      cue: SECRET_SHOW[secret].cue,
    }),
  );

  // Every Route, the menu's in menu order, then the others (MDF 2025 plays
  // the legendary achievement's unlock, the patch notes the press)
  const pages = Object.values(ROUTES)
    .map((route) => ({ route, tab: MENU_ROUTES.indexOf(route) }))
    .sort((a, b) => (a.tab < 0 ? 1 : 0) - (b.tab < 0 ? 1 : 0))
    .map(({ route, tab }): Command => {
      const key = route.messageKey;
      return {
        id: `page-${key}`,
        section: "pages",
        label: texts.Routes[key].label,
        terms: [
          ...every((t) => t.Routes[key].label),
          ...every((t) => t.Routes[key].title),
          ...every((t) => t.QuickMenu.keywords[key]),
        ],
        action: { kind: "navigate", href: route.path },
        ...(tab >= 0
          ? { cue: "tab", tab }
          : { cue: key === "mdf2025" ? "unlock" : "press" }),
      };
    });

  const projects = input.projects.map(
    (project): Command => ({
      id: `project-${project.slug}`,
      section: "projects",
      label: project.title,
      terms: [
        normalize(project.slug),
        ...every((t) => t.QuickMenu.keywords.project),
      ],
      action: { kind: "navigate", href: projectPath(project.slug) },
      cue: "toggleOn",
      rarity: project.rarity,
    }),
  );

  const arcade = CABINETS.filter(
    (cabinet) => cabinet.status === "playable",
  ).map(
    (cabinet): Command => ({
      id: `arcade-${cabinet.id}`,
      section: "arcade",
      label: fill(
        texts.QuickMenu.commands.play,
        texts.Arcade.cabinets[cabinet.id].name,
      ),
      terms: [
        ...every((t) => t.Arcade.cabinets[cabinet.id].tagline),
        ...every((t) => t.QuickMenu.keywords.game),
      ],
      action: { kind: "arcade", cabinet: cabinet.id },
      cue: "confirm",
    }),
  );

  const palettes = PALETTES.map(
    (palette): Command => ({
      id: `palette-${palette}`,
      section: "settings",
      label: fill(texts.QuickMenu.commands.palette, texts.ThemeSwitch[palette]),
      terms: [
        normalize(palette),
        ...every((t) =>
          fill(t.QuickMenu.commands.palette, t.ThemeSwitch[palette]),
        ),
        ...every((t) => t.QuickMenu.keywords.palette),
      ],
      action: { kind: "palette", palette },
      cue: "toggleOn",
      current: state.palette === palette,
    }),
  );

  const modes = MODES.map(
    (mode): Command => ({
      id: `mode-${mode}`,
      section: "settings",
      label: fill(texts.QuickMenu.commands.mode, texts.ThemeSwitch[mode]),
      terms: [
        ...every((t) => fill(t.QuickMenu.commands.mode, t.ThemeSwitch[mode])),
        ...every((t) => t.QuickMenu.keywords.mode),
      ],
      action: { kind: "mode", mode },
      cue: "toggleOn",
      current: state.mode === mode,
    }),
  );

  const other: Locale = input.locale === "en" ? "fr" : "en";
  const settings: Command[] = [
    ...palettes,
    ...modes,
    {
      id: "locale",
      section: "settings",
      label: texts.QuickMenu.commands.locale,
      terms: [
        normalize(other),
        ...every((t) => t.QuickMenu.commands.locale),
        ...every((t) => t.QuickMenu.keywords.locale),
      ],
      action: { kind: "locale", locale: other },
      cue: "toggleOn",
    },
    {
      id: "sound",
      section: "settings",
      label: state.sound
        ? texts.QuickMenu.commands.mute
        : texts.QuickMenu.commands.unmute,
      terms: [
        ...every((t) => t.QuickMenu.commands.mute),
        ...every((t) => t.QuickMenu.commands.unmute),
        ...every((t) => t.QuickMenu.keywords.sound),
      ],
      action: { kind: "sound" },
      cue: null,
    },
  ];

  const link = (
    id: "copyLink" | "linkedin" | "github" | "discord" | "poke" | "resume",
    action: Action,
    cue: Cue | null,
  ): Command => ({
    id: `link-${id}`,
    section: "links",
    label: texts.QuickMenu.commands[id],
    terms: [
      ...every((t) => t.QuickMenu.commands[id]),
      ...every((t) => t.QuickMenu.keywords[id]),
    ],
    action,
    cue,
  });

  const links = [
    link("copyLink", { kind: "copyLink" }, "confirm"),
    link("linkedin", { kind: "external", href: input.links.linkedin }, "press"),
    link("github", { kind: "external", href: input.links.github }, "press"),
    link("discord", { kind: "external", href: input.links.discord }, "press"),
    // The wave plays its own note once Discord has it
    ...(input.poke ? [link("poke", { kind: "poke" }, null)] : []),
    link("resume", { kind: "download", href: input.links.resume }, "confirm"),
  ];

  return [...secrets, ...pages, ...projects, ...arcade, ...settings, ...links];
};

/**
 * How well a normalized query matches one normalized text, 0 for not at
 * all: whole text, then its start, a word's start, anywhere in it, then the
 * query's letters in order (fuzzy), worth more when they run together.
 */
export const scoreText = (query: string, text: string): number => {
  if (!query || !text) return 0;
  if (text === query) return 100;
  if (text.startsWith(query)) return 90;
  if (text.split(" ").some((word) => word.startsWith(query))) return 75;
  if (text.includes(query)) return 60;
  if (query.length < 2) return 0;
  // The query's letters in order, each as early as possible
  const letters = query.replace(/ /g, "");
  let at = -1;
  let runs = 0;
  let previous = -2;
  for (const letter of letters) {
    at = text.indexOf(letter, at + 1);
    if (at < 0) return 0;
    if (at !== previous + 1) runs += 1;
    previous = at;
  }
  // Fewer separate runs read as a closer match; a scattered one barely counts
  return Math.max(1, 40 - (runs - 1) * 8);
};

/** Whether a secret's words reveal it for this normalized query. */
const revealsSecret = (query: string, terms: ReadonlyArray<string>) =>
  terms.some(
    (term) =>
      query === term ||
      query.startsWith(`${term} `) ||
      (query.length >= Math.min(3, term.length) && term.startsWith(query)),
  );

/** A command's score for a normalized query: its best text, the label first. */
const scoreCommand = (query: string, command: Command): number => {
  if (command.section === "secrets") {
    return revealsSecret(query, command.terms) ? 110 : 0;
  }
  const texts = [normalize(command.label), ...command.terms];
  const best = (q: string) =>
    Math.max(
      ...texts.map((text, i) => scoreText(q, text) * (i === 0 ? 1 : 0.9)),
    );
  const whole = best(query);
  if (whole > 0) return whole;
  // Several words: each must match somewhere ("plum dark" finds nothing,
  // "palette plum" finds the plum palette)
  const tokens = query.split(" ");
  if (tokens.length < 2) return 0;
  const scores = tokens.map(best);
  return scores.every((score) => score > 0) ? Math.min(...scores) * 0.8 : 0;
};

/** A score above any loose (letters in order) match. */
const CLOSE_MATCH = 50;

/**
 * The commands a query shows, best first (ties keep their order). Loose
 * matches show only when nothing matches closely, so "sudo" finds its secret
 * and not every text with an s, a u, a d and an o. An empty query shows every
 * command but the secrets, in section order.
 */
export const filterCommands = (
  commands: ReadonlyArray<Command>,
  query: string,
): Command[] => {
  const normalized = normalize(query);
  if (!normalized) {
    return commands.filter((command) => command.section !== "secrets");
  }
  const scored = commands
    .map((command, i) => ({
      command,
      i,
      score: scoreCommand(normalized, command),
    }))
    .filter(({ score }) => score > 0);
  const floor = scored.some(({ score }) => score >= CLOSE_MATCH)
    ? CLOSE_MATCH
    : 0;
  return scored
    .filter(({ score }) => score >= floor)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ command }) => command);
};

/**
 * Commands grouped by section, the sections in the order of their best
 * command, so the best match always leads.
 */
export const groupBySection = (
  commands: ReadonlyArray<Command>,
): ReadonlyArray<{ section: Section; commands: Command[] }> => {
  const groups = new Map<Section, Command[]>();
  for (const command of commands) {
    const group = groups.get(command.section);
    if (group) group.push(command);
    else groups.set(command.section, [command]);
  }
  return [...groups].map(([section, commands]) => ({ section, commands }));
};
