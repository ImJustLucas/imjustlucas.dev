import { RefreshCw, Wrench } from "lucide-react";

import { Sparkle } from "@/components/sparkle";
import type { PatchInLocale, PatchTag } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** The order lines are read in: what's new, what changed, what got fixed. */
const TAG_ORDER: ReadonlyArray<PatchTag> = ["new", "changed", "fixed"];

/**
 * Each tag's chip: "new" the live tag's Online fill with the tattoo sparkle,
 * "changed" the WIP tag's seam outline, "fixed" the seam fill; each with its
 * own icon, so colour is never the only difference.
 */
const TAG_STYLE: Record<
  PatchTag,
  { readonly chip: string; readonly icon: React.ReactNode }
> = {
  new: {
    chip: "bg-online text-on-bright",
    icon: <Sparkle className="size-3" />,
  },
  changed: {
    chip: "border-2 border-seam text-ink",
    icon: <RefreshCw aria-hidden className="size-3" strokeWidth={2.5} />,
  },
  fixed: {
    chip: "bg-seam text-ink",
    icon: <Wrench aria-hidden className="size-3" strokeWidth={2.5} />,
  },
};

export type TagLabels = Readonly<Record<PatchTag, string>>;

/**
 * A folded patch's lines counted by tag, each count after its tag's icon in
 * the muted ink, e.g. ✦ 3 🔧 1; read as "3 new, 1 fixed".
 */
export function PatchTally({
  entries,
  tagLabels,
  className,
}: {
  entries: PatchInLocale["entries"];
  tagLabels: TagLabels;
  className?: string;
}) {
  const counts = TAG_ORDER.map(
    (tag) =>
      [tag, entries.filter((entry) => entry.tag === tag).length] as const,
  ).filter(([, count]) => count > 0);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-data tabular-nums text-ink-muted",
        className,
      )}
    >
      {counts.map(([tag, count]) => (
        <span key={tag} className="inline-flex items-center gap-1">
          {TAG_STYLE[tag].icon}
          <span aria-hidden>{count}</span>
          <span className="sr-only">
            {count} {tagLabels[tag]}
          </span>
        </span>
      ))}
    </span>
  );
}

export function PatchTagChip({ tag, label }: { tag: PatchTag; label: string }) {
  const style = TAG_STYLE[tag];
  return (
    <span
      className={cn(
        "inline-flex h-6 w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-tag",
        // The outline's border takes the place of padding, so all chips match
        tag === "changed" && "px-2",
        style.chip,
      )}
    >
      {style.icon}
      {label}
    </span>
  );
}

/**
 * A patch's lines as a game prints them: new first, then changes, then
 * fixes, each after its chip, the chips one aligned column.
 */
export function PatchLines({
  entries,
  tagLabels,
  className,
}: {
  entries: PatchInLocale["entries"];
  tagLabels: TagLabels;
  className?: string;
}) {
  const ordered = TAG_ORDER.flatMap((tag) =>
    entries.filter((entry) => entry.tag === tag),
  );
  return (
    <ul
      className={cn(
        // Phones: each chip over its line, so the text keeps the full width
        "flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-3",
        className,
      )}
    >
      {ordered.map((entry, i) => (
        <li
          key={i}
          className="flex flex-col items-start gap-1.5 sm:col-span-2 sm:grid sm:grid-cols-subgrid"
        >
          <span className="sm:w-full sm:pt-0.5">
            <PatchTagChip tag={entry.tag} label={tagLabels[entry.tag]} />
          </span>
          <span className="max-w-[65ch] text-pretty leading-[1.65] text-ink">
            {entry.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
