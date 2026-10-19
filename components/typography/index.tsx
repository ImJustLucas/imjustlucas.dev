import { cn } from "@/lib/utils";

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
};

export const TypographyH2: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
    >
      {children}
    </h2>
  );
};

export const TypographyH3: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight mt-4",
        className,
      )}
    >
      {children}
    </h3>
  );
};

export const TypographyH4: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
    >
      {children}
    </h4>
  );
};

export const TypographyP: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  );
};

export const TypographySmall: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <small className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </small>
  );
};

export const TypographyMuted: React.FC<TypographyProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
};

export const Bold: React.FC<TypographyProps> = ({ children, className }) => {
  return <span className={cn("font-semibold", className)}>{children}</span>;
};
