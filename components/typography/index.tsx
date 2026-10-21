import { cn } from "@/lib/utils";

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
};

type HeadingProps = TypographyProps & {
  /** The element, so the role's look never dictates the outline. */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  id?: string;
};

/**
 * Display: the greeting on the profile banner. One per page at most;
 * Unbounded, never forced to uppercase (the copy keeps its case).
 */
export const TypographyDisplay: React.FC<HeadingProps> = ({
  as: Tag = "h1",
  children,
  className,
  id,
}) => (
  <Tag
    id={id}
    className={cn("font-display text-display text-balance", className)}
  >
    {children}
  </Tag>
);

/** Headline: a page title, the one visible `h1` of a page. */
export const TypographyHeadline: React.FC<HeadingProps> = ({
  as: Tag = "h1",
  children,
  className,
  id,
}) => (
  <Tag
    id={id}
    className={cn(
      "scroll-m-20 font-display text-headline text-balance",
      className,
    )}
  >
    {children}
  </Tag>
);

/** Title: section titles, item and achievement names. */
export const TypographyTitle: React.FC<HeadingProps> = ({
  as: Tag = "h2",
  children,
  className,
  id,
}) => (
  <Tag
    id={id}
    className={cn(
      "scroll-m-20 font-display text-title text-balance",
      className,
    )}
  >
    {children}
  </Tag>
);

/** Data: periods, dates, star counts, elapsed time; tabular figures. */
export const TypographyData: React.FC<
  TypographyProps & {
    as?: "span" | "p" | "time";
    dateTime?: string;
    "aria-hidden"?: boolean;
  }
> = ({
  as: Tag = "span",
  children,
  className,
  dateTime,
  "aria-hidden": ariaHidden,
}) => (
  <Tag
    dateTime={dateTime}
    aria-hidden={ariaHidden}
    className={cn("font-mono text-data tabular-nums", className)}
  >
    {children}
  </Tag>
);

/** Tag: rarity, "live" and "new" tags, chips. */
export const TypographyTag: React.FC<
  TypographyProps & { style?: React.CSSProperties; id?: string }
> = ({ children, className, style, id }) => (
  <span id={id} style={style} className={cn("text-tag", className)}>
    {children}
  </span>
);

export const TypographyH1: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <TypographyHeadline as="h1" className={className}>
    {children}
  </TypographyHeadline>
);

export const TypographyH2: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <TypographyHeadline as="h2" className={cn("pb-2", className)}>
    {children}
  </TypographyHeadline>
);

export const TypographyH3: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <TypographyTitle as="h3" className={cn("mt-4 text-[1.375rem]", className)}>
    {children}
  </TypographyTitle>
);

export const TypographyH4: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <TypographyTitle as="h4" className={className}>
    {children}
  </TypographyTitle>
);

/** Body: paragraphs, capped at 65ch. */
export const TypographyP: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      "max-w-[65ch] leading-[1.65] [&:not(:first-child)]:mt-6",
      className,
    )}
  >
    {children}
  </p>
);

export const TypographySmall: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <small className={cn("text-label leading-none", className)}>{children}</small>
);

/** Secondary text: Haze in the dark theme, Dusk in the light one. */
export const TypographyMuted: React.FC<TypographyProps> = ({
  children,
  className,
}) => <p className={cn("text-label text-ink-muted", className)}>{children}</p>;

/**
 * A secondary link: the action ink, underlined in the palette's link line;
 * in the dark modes the ink, taking the action ink on hover.
 */
export const SECONDARY_LINK =
  "rounded-md text-action-ink underline decoration-link-line decoration-2 underline-offset-4 transition-colors duration-hover ease-out dark:text-ink dark:hover:text-action-ink";

export const Bold: React.FC<TypographyProps> = ({ children, className }) => {
  return <span className={cn("font-semibold", className)}>{children}</span>;
};
