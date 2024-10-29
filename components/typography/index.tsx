type TypographyType = {
  children: React.ReactNode;
  bold?: boolean;
};

export const TypographyH3: React.FC<TypographyType> = ({
  children,
  bold = true,
}) => {
  return (
    <h3
      className={`scroll-m-20 text-2xl  tracking-tight  ${
        bold ? "font-semibold" : ""
      }`.trim()}
    >
      {children}
    </h3>
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
