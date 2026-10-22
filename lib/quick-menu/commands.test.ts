import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes";
import { CABINETS } from "@/lib/arcade/cabinets";
import { PALETTES } from "@/lib/palette";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import {
  buildCommands,
  type Command,
  type CommandsInput,
  filterCommands,
  groupBySection,
  normalize,
  scoreText,
} from "./commands";

const input = (changes: Partial<CommandsInput> = {}): CommandsInput => ({
  locale: "en",
  texts: { en, fr },
  projects: [
    { slug: "predi-gg", title: "Predi.GG", rarity: "epic" },
    { slug: "bam-karaoke", title: "Bam Karaoke", rarity: "rare" },
  ],
  links: {
    linkedin: "https://www.linkedin.com/in/lucasbellier/",
    github: "https://github.com/ImJustLucas",
    discord: "https://discord.com/users/1",
    resume: "/pdf/cv-lucas.pdf",
  },
  state: { palette: "electric", mode: "dark", sound: true },
  ...changes,
});

const ids = (commands: ReadonlyArray<Command>) => commands.map((c) => c.id);
const search = (query: string, changes?: Partial<CommandsInput>) =>
  ids(filterCommands(buildCommands(input(changes)), query));

describe("buildCommands", () => {
  const commands = buildCommands(input());

  it("goes to every Route, the menu's first, each with its tab's note", () => {
    const pages = commands.filter((c) => c.section === "pages");
    expect(pages.map((c) => c.action)).toEqual(
      [
        ROUTES.me,
        ROUTES.what,
        ROUTES.experiences,
        ROUTES.videos,
        ROUTES.arcade,
        ROUTES.contact,
        ROUTES.mdf2025,
        ROUTES.patchNotes,
        ROUTES.cv,
      ].map((route) => ({ kind: "navigate", href: route.path })),
    );
    expect(pages.map((c) => c.tab)).toEqual([
      0,
      1,
      2,
      3,
      4,
      5,
      undefined,
      undefined,
      undefined,
    ]);
    expect(pages.slice(-3).map((c) => c.cue)).toEqual([
      "unlock",
      "press",
      "press",
    ]);
  });

  it("opens every Project's page, with its rarity", () => {
    expect(
      commands
        .filter((c) => c.section === "projects")
        .map((c) => [c.label, c.action, c.rarity]),
    ).toEqual([
      ["Predi.GG", { kind: "navigate", href: "/what/predi-gg" }, "epic"],
      ["Bam Karaoke", { kind: "navigate", href: "/what/bam-karaoke" }, "rare"],
    ]);
  });

  it("launches every playable cabinet", () => {
    expect(
      commands.filter((c) => c.section === "arcade").map((c) => c.action),
    ).toEqual(
      CABINETS.filter((c) => c.status === "playable").map((c) => ({
        kind: "arcade",
        cabinet: c.id,
      })),
    );
  });

  it("marks the current palette and mode", () => {
    const current = commands.filter((c) => c.current).map((c) => c.id);
    expect(current).toEqual(["palette-electric", "mode-dark"]);
    expect(
      ids(
        buildCommands(
          input({ state: { palette: "surf", mode: undefined, sound: true } }),
        ).filter((c) => c.current),
      ),
    ).toEqual(["palette-surf"]);
    expect(commands.filter((c) => c.action.kind === "palette")).toHaveLength(
      PALETTES.length,
    );
  });

  it("switches to the other Locale", () => {
    const locale = (locale: "en" | "fr") =>
      buildCommands(input({ locale })).find((c) => c.id === "locale");
    expect(locale("en")?.action).toEqual({ kind: "locale", locale: "fr" });
    expect(locale("en")?.label).toBe(en.QuickMenu.commands.locale);
    expect(locale("fr")?.action).toEqual({ kind: "locale", locale: "en" });
    expect(locale("fr")?.label).toBe(fr.QuickMenu.commands.locale);
  });

  it("offers to mute while sound is on and to unmute while it is off", () => {
    const sound = (on: boolean) =>
      buildCommands(
        input({ state: { palette: "electric", mode: "dark", sound: on } }),
      ).find((c) => c.id === "sound")?.label;
    expect(sound(true)).toBe(en.QuickMenu.commands.mute);
    expect(sound(false)).toBe(en.QuickMenu.commands.unmute);
  });

  it("links to the Profile's places and copies the page's link", () => {
    expect(
      commands.filter((c) => c.section === "links").map((c) => c.action),
    ).toEqual([
      { kind: "copyLink" },
      { kind: "external", href: "https://www.linkedin.com/in/lucasbellier/" },
      { kind: "external", href: "https://github.com/ImJustLucas" },
      { kind: "external", href: "https://discord.com/users/1" },
      { kind: "download", href: "/pdf/cv-lucas.pdf" },
    ]);
  });

  it("labels everything in the visitor's Locale", () => {
    const fr_ = buildCommands(input({ locale: "fr" }));
    expect(fr_.find((c) => c.id === "page-what")?.label).toBe(
      fr.Routes.what.label,
    );
    expect(fr_.find((c) => c.id === "palette-plum")?.label).toBe(
      "palette prune",
    );
    expect(fr_.find((c) => c.id === "arcade-surf")?.label).toBe("jouer à Surf");
  });

  it("has unique ids", () => {
    expect(new Set(ids(commands)).size).toBe(commands.length);
  });

  it("still builds before the other Locale's texts arrive", () => {
    expect(buildCommands(input({ texts: { en } }))).toHaveLength(
      commands.length,
    );
  });
});

describe("filterCommands", () => {
  it("shows every command but the secrets for an empty query", () => {
    const all = buildCommands(input());
    expect(filterCommands(all, "  ")).toEqual(
      all.filter((c) => c.section !== "secrets"),
    );
  });

  it("finds a page by its label, its title or a keyword", () => {
    expect(search("what i've done")[0]).toBe("page-what");
    expect(search("experiences")[0]).toBe("page-experiences");
    expect(search("youtube")[0]).toBe("page-videos");
    expect(search("changelog")[0]).toBe("page-patchNotes");
    expect(search("nouveautés")[0]).toBe("page-patchNotes");
  });

  it("searches both Locales, whatever the visitor's", () => {
    expect(search("projets")[0]).toBe("page-what");
    expect(search("expériences")[0]).toBe("page-experiences");
    expect(search("experiences", { locale: "fr" })[0]).toBe("page-experiences");
    expect(search("sombre")).toContain("mode-dark");
  });

  it("ignores accents and case", () => {
    expect(search("EXPERIENCES")[0]).toBe("page-experiences");
    expect(search("vidéos")[0]).toBe("page-videos");
  });

  it("matches loosely, letters in order", () => {
    expect(search("prdgg")[0]).toBe("project-predi-gg");
    expect(search("bmkrk")[0]).toBe("project-bam-karaoke");
  });

  it("ranks whole and leading matches above loose ones", () => {
    const results = search("surf");
    expect(results.slice(0, 2).sort()).toEqual(["arcade-surf", "palette-surf"]);
  });

  it("needs every word of a query to match", () => {
    expect(search("palette plum")[0]).toBe("palette-plum");
    expect(search("plum zebra")).toEqual([]);
  });

  it("drops loose matches when something matches closely", () => {
    expect(search("sudo")).toEqual(["secret-hire"]);
    expect(search("pal")).not.toContain("arcade-ollie");
    expect(search("pal")[0]).toBe("palette-electric");
  });

  it("finds nothing for gibberish", () => {
    expect(search("qqqqzx")).toEqual([]);
  });

  it("reveals a secret only for its words", () => {
    expect(search("konami")[0]).toBe("secret-konami");
    expect(search("kon")[0]).toBe("secret-konami");
    expect(search("ko")).not.toContain("secret-konami");
    expect(search("do a barrel roll")[0]).toBe("secret-barrelRoll");
    expect(search("café")[0]).toBe("secret-coffee");
    expect(search("gg")[0]).toBe("secret-gg");
    expect(search("sudo hire lucas")[0]).toBe("secret-hire");
    expect(search("hire me")[0]).toBe("secret-hire");
    expect(search("dodo")[0]).toBe("secret-sleep");
    expect(search("predi")).not.toContain("secret-gg");
  });
});

describe("groupBySection", () => {
  it("keeps the order of each section's best command", () => {
    const commands = filterCommands(buildCommands(input()), "surf");
    const groups = groupBySection(commands);
    expect(groups.map((g) => g.section)).toEqual([
      ...new Set(commands.map((c) => c.section)),
    ]);
    expect(groups.flatMap((g) => g.commands)).toHaveLength(commands.length);
  });
});

describe("scoreText", () => {
  it("prefers whole, then leading, then word, then inner, then loose", () => {
    const scores = [
      scoreText("surf", "surf"),
      scoreText("surf", "surf palette"),
      scoreText("surf", "play surf"),
      scoreText("urf", "play surf"),
      scoreText("sf", "surf"),
    ];
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(scores.every((score) => score > 0)).toBe(true);
  });

  it("is zero when the letters are missing or out of order", () => {
    expect(scoreText("fs", "surf")).toBe(0);
    expect(scoreText("x", "surf")).toBe(0);
  });
});

describe("normalize", () => {
  it("drops accents, case and punctuation", () => {
    expect(normalize("  Ce que j'ai FAIT ! ")).toBe("ce que j ai fait");
    expect(normalize("Expériences")).toBe("experiences");
  });
});
