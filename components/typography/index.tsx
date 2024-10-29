import { cn } from "@/lib/utils";

type TypographyType = {
  children: React.ReactNode;
  bold?: boolean;
};

export const TypographyH2: React.FC<
  TypographyType & {
    border?: boolean;
  }
> = ({ children, bold = true, border = true }) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        bold && "font-semibold",
        border && "border-b",
      )}
    >
      {children}
    </h2>
  );
};

export const TypographyH3: React.FC<TypographyType> = ({
  children,
  bold = true,
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl  tracking-tight  mt-4",
        bold && "font-semibold",
      )}
    >
      {children}
    </h3>
  );
};

export const TypographyH4: React.FC<TypographyType> = ({
  children,
  bold = true,
}) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl  tracking-tight",
        bold && "font-semibold",
      )}
    >
      {children}
    </h4>
  );
};

export const TypographyP: React.FC<TypographyType> = ({ children }) => {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
};

export const TypographySmall: React.FC<TypographyType> = ({ children }) => {
  return <small className="text-sm font-medium leading-none">{children}</small>;
};

export const TypographyMuted: React.FC<TypographyType> = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

export const Bold: React.FC<TypographyType> = ({ children }) => {
  return <span className="font-semibold">{children}</span>;
};
