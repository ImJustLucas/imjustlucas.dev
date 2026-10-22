import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { UnlockTrophy } from "@/components/trophies/UnlockTrophy";
import {
  TypographyData,
  TypographyHeadline,
  TypographyP,
} from "@/components/typography";

/**
 * The 404 screen (DESIGN.md, Not found): Lucas asleep on his stage disc in a
 * raised slot with a seam border and the tray, the headline, one line in his
 * voice, then the one Play button home with the error code in Data under it.
 * The page that shows it centres it.
 */
export function NotFoundSlot({
  headline,
  message,
  action,
  code,
  chibiAlt,
}: {
  headline: React.ReactNode;
  message: React.ReactNode;
  /** The Play button home. */
  action: React.ReactNode;
  code: React.ReactNode;
  chibiAlt: string;
}) {
  return (
    <section className="tray flex w-full max-w-[34rem] flex-col items-center rounded-lg border-2 border-seam bg-raised px-5 pb-7 pt-5 text-center sm:px-10 sm:pb-9 sm:pt-6">
      <div className="relative size-40 sm:size-52">
        {/* The chibi's stage, as on the banners */}
        <span
          aria-hidden
          className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
        />
        <ChibiSprite
          pose="sleeping"
          alt={chibiAlt}
          sizes="(min-width: 640px) 208px, 160px"
          priority
          className="size-full"
        />
      </div>
      <TypographyHeadline className="mt-4">{headline}</TypographyHeadline>
      <TypographyP className="text-pretty text-[1.0625rem] font-medium text-ink-muted [&:not(:first-child)]:mt-3">
        {message}
      </TypographyP>
      <div className="mt-7 flex w-full flex-col items-center gap-3">
        {action}
        <TypographyData className="text-ink-muted">{code}</TypographyData>
      </div>
      <UnlockTrophy id="lost" />
    </section>
  );
}
