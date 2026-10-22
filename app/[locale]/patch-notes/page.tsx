import { getLocale, getTranslations } from "next-intl/server";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { PageBanner, routeMetadata } from "@/components/page-header";
import { CurrentPatch } from "@/components/patch-notes/CurrentPatch";
import { MarkPatchSeen } from "@/components/patch-notes/MarkPatchSeen";
import {
  PatchSeasons,
  type Season,
} from "@/components/patch-notes/PatchSeasons";
import { TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { seasonOf } from "@/lib/content/patch-version";
import { getPatchNotes } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.patchNotes);

/**
 * The site's patch notes, as a game client's "what's new" screen: the
 * current version open, then every older one season by season, folded.
 */
export default async function PatchNotesPage() {
  const locale = await getLocale();
  const [patches, t] = await Promise.all([
    getPatchNotes(locale),
    getTranslations("PatchNotes"),
  ]);
  const [current] = patches;

  // Newest first already, so the seasons come newest first too; the current
  // patch counts in its season but is shown open above it
  const seasons = patches.reduce<Array<Season>>((all, patch) => {
    const number = seasonOf(patch.version);
    const last = all.at(-1);
    const season: Season =
      last?.number === number
        ? last
        : { number, count: 0, from: patch.date, to: patch.date, patches: [] };
    const next: Season = {
      ...season,
      count: season.count + 1,
      from: patch.date,
      patches: patch === current ? season.patches : [...season.patches, patch],
    };
    return season === last ? [...all.slice(0, -1), next] : [...all, next];
  }, []);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.patchNotes}
        intro={t("intro")}
        pose="coding"
        poseAlt={t("chibiAlt")}
      />

      {current ? (
        <>
          <MarkPatchSeen version={current.version} />
          <CurrentPatch patch={current} />
          <PatchSeasons
            seasons={seasons.filter((season) => season.patches.length > 0)}
          />
        </>
      ) : (
        <div className="tray flex flex-col items-center gap-5 rounded-lg bg-raised p-6 text-center sm:flex-row sm:p-card sm:text-left">
          <div className="relative size-32 shrink-0 sm:size-36">
            <span
              aria-hidden
              className="absolute inset-[6%] rounded-full bg-ground"
            />
            <ChibiSprite
              pose="chilling"
              alt=""
              sizes="144px"
              className="size-full"
            />
          </div>
          <TypographyP>{t("empty")}</TypographyP>
        </div>
      )}
    </div>
  );
}
