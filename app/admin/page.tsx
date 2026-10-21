import Link from "next/link";

import { ArrowRight, CircleCheck, FileText, Layers } from "lucide-react";

import { ADMIN_TABS } from "@/app/admin/admin-nav";
import { ContentUnavailableScreen } from "@/app/admin/admin-screens";
import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import {
  TypographyData,
  TypographyHeadline,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { type AdminAlert, monthsBetween, parisDay } from "@/lib/admin/alerts";
import { contentBranch } from "@/lib/admin/config";
import { getOverview } from "@/lib/admin/server";

const day = new Intl.DateTimeFormat("fr", {
  dateStyle: "long",
  timeZone: "UTC",
});

/** A Resume's date, e.g. 07/10/2025. */
const short = (date: string) =>
  new Date(date).toLocaleDateString("fr", { timeZone: "UTC" });

const RESUME = { en: "Le CV anglais", fr: "Le CV français" } as const;

type Todo = {
  readonly key: string;
  readonly title: string;
  readonly detail: string;
  readonly icon: typeof FileText;
  /** Where to fix it: one link, or one per Resume. */
  readonly actions: ReadonlyArray<{ href: string; label: string }>;
};

const WHY_RESUME = "C'est lui que le bouton de l'accueil télécharge.";

/**
 * The alerts as things to do: what is wrong, why it matters and where to
 * fix it. Two Resumes stale for the same reason make one item.
 */
const todos = (
  alerts: ReadonlyArray<AdminAlert>,
  today: string,
): ReadonlyArray<Todo> => {
  const resumes = alerts.filter((a) => a.kind === "stale-resume");
  const sameCause =
    resumes.length === 2 &&
    resumes[0].newerExperience === resumes[1].newerExperience;
  const resumeTodos: ReadonlyArray<Todo> = sameCause
    ? [
        {
          key: "resumes",
          title: resumes[0].newerExperience
            ? `Les deux CV datent d'avant ton arrivée chez ${resumes[0].newerExperience}`
            : "Les deux CV ont plus de six mois",
          detail: `Français du ${day.format(new Date(resumes.find((r) => r.locale === "fr")!.lastUpdated))}, anglais du ${day.format(new Date(resumes.find((r) => r.locale === "en")!.lastUpdated))}. Ce sont eux que le bouton de l'accueil télécharge.`,
          icon: FileText,
          actions: (["fr", "en"] as const).map((locale) => ({
            href: `/admin/profile#cv-${locale}`,
            label: locale === "fr" ? "CV français" : "CV anglais",
          })),
        },
      ]
    : resumes.map((alert) => ({
        key: `cv-${alert.locale}`,
        title: `${RESUME[alert.locale]} date du ${day.format(new Date(alert.lastUpdated))}`,
        detail: alert.newerExperience
          ? `Il est plus ancien que ton arrivée chez ${alert.newerExperience}. ${WHY_RESUME}`
          : `Il a ${monthsBetween(alert.lastUpdated, today)} mois. ${WHY_RESUME}`,
        icon: FileText,
        actions: [
          { href: `/admin/profile#cv-${alert.locale}`, label: "Nouveau CV" },
        ],
      }));
  const projectTodos = alerts.flatMap((alert): Todo[] =>
    alert.kind === "project-without-tech"
      ? [
          {
            key: `project-${alert.index}`,
            title: `${alert.title} n'a aucune Tech`,
            detail:
              "Sa carte n'a pas de puces et il sort de chaque filtre de la page des Projects.",
            icon: Layers,
            actions: [
              {
                href: `/admin/projects#project-${alert.index}`,
                label: "Choisir ses Techs",
              },
            ],
          },
        ]
      : [],
  );
  return [...resumeTodos, ...projectTodos];
};

/** The Admin home: what to fix, then a way into each editor. */
export default async function AdminHome() {
  const today = parisDay(new Date());
  const overview = await getOverview(today);
  if (overview.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={overview.reason}
        branch={contentBranch()}
      />
    );
  if (overview.kind !== "owner") return null;
  const { counts, resumes, alerts } = overview;
  const list = todos(alerts, today);

  const stats: { readonly [href: string]: string } = {
    "/admin/projects": `${counts.projects} · ${counts.featured} sur l'accueil`,
    "/admin/experiences": `${counts.experiences} · ${counts.ongoing} en cours`,
    "/admin/techs": `${counts.techs}`,
    "/admin/achievements": `${counts.achievements}`,
    "/admin/hobbies": `${counts.hobbies}`,
    "/admin/profile": `CV FR ${short(resumes.fr)} · EN ${short(resumes.en)}`,
    "/admin/arcade": "classements des bornes",
  };

  return (
    <div className="mx-auto flex max-w-[56rem] flex-col gap-10">
      <header className="tray grid items-center gap-x-4 gap-y-2 rounded-lg border-2 border-seam bg-raised p-4 sm:grid-cols-[1fr_120px] sm:p-6 md:px-7 md:py-5">
        <div className="min-w-0">
          <TypographyHeadline>Admin</TypographyHeadline>
          <TypographyMuted className="mt-2 max-w-[60ch] text-pretty text-[1.0625rem] font-medium text-ink-muted">
            Chaque enregistrement est publié directement sur{" "}
            <TypographyData className="rounded-sm bg-ground px-1.5 py-0.5 text-ink">
              {contentBranch()}
            </TypographyData>{" "}
            et sera en ligne environ une minute plus tard.
          </TypographyMuted>
        </div>
        <div className="relative self-end max-sm:hidden">
          <span
            aria-hidden
            className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
          />
          <ChibiSprite
            pose="coding"
            alt=""
            sizes="120px"
            priority
            className="aspect-square w-full"
          />
        </div>
      </header>

      <section aria-labelledby="todo" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <TypographyTitle id="todo">À faire</TypographyTitle>
          {list.length > 0 && (
            <TypographyData className="text-ink-muted">
              {list.length}
            </TypographyData>
          )}
        </div>
        {list.length === 0 ? (
          <TypographyMuted className="tray flex items-center gap-3 rounded-lg bg-raised px-5 py-4 text-label text-ink">
            <CircleCheck
              aria-hidden
              className="size-5 shrink-0 text-online-ink"
            />
            Rien à corriger : les CV sont récents et chaque Project a ses Techs.
          </TypographyMuted>
        ) : (
          <ul className="tray flex flex-col rounded-lg bg-raised px-4 sm:px-5">
            {list.map(({ key, title, detail, icon: Icon, actions }) => (
              <li
                key={key}
                className="flex items-start gap-4 border-seam py-4 [&:not(:first-child)]:border-t-2"
              >
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-away text-on-bright">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-pretty text-label font-semibold text-ink">
                    {title}
                  </span>
                  <span className="text-pretty text-label font-normal text-ink-muted">
                    {detail}
                  </span>
                  <span className="mt-2.5 flex flex-wrap gap-2">
                    {actions.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="ledge inline-flex h-9 items-center gap-1.5 rounded-md border-2 border-seam bg-ground px-3 text-label text-ink [&_svg]:size-4"
                      >
                        {label}
                        <ArrowRight aria-hidden />
                      </Link>
                    ))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="editors" className="flex flex-col gap-4">
        <TypographyTitle id="editors">Le contenu</TypographyTitle>
        <ul className="tray flex flex-col rounded-lg bg-raised p-1.5">
          {ADMIN_TABS.slice(1).map(({ href, label, icon: Icon }) => (
            <li
              key={href}
              className="border-seam [&:not(:first-child)]:border-t-2"
            >
              <Link
                href={href}
                className="group flex min-h-16 items-center gap-4 rounded-md px-3.5 py-3 transition-colors duration-hover ease-out hover:bg-seam/40"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-ground text-ink ring-2 ring-seam">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="font-display text-title text-ink">
                    {label}
                  </span>
                  <TypographyData className="truncate text-ink-muted">
                    {stats[href]}
                  </TypographyData>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-5 shrink-0 text-ink-muted transition-transform duration-hover ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
