type TypographyType = {
  children: React.ReactNode;
  bold?: boolean;
};

const BASE_CLASS = "font-geist-sans text-neutral-50";

export const TypographyH3: React.FC<TypographyType> = ({
  children,
  bold = true,
}) => {
  return (
    <h3
      className={`${BASE_CLASS} scroll-m-20 text-2xl  tracking-tight  ${
        bold ? "font-semibold" : ""
      }`.trim()}
    >
      {children}
    </h3>
  );
};

export const TypographyP: React.FC<TypographyType> = ({ children }) => {
  return (
    <p className={`${BASE_CLASS} leading-7 [&:not(:first-child)]:mt-6`}>
      {children}
    </p>
  );
};

export const TypographySmall: React.FC<TypographyType> = ({ children }) => {
  return (
    <small className={`text-sm font-medium leading-none`}>{children}</small>
  );
};
