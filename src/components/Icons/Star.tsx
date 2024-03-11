import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  color?: string;
  size?: string;
};

export const StarIcon: React.FC<IconProps> = ({
  color = "#09090B",
  size = "30px",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 0L19.1366 10.8634L30 15L19.1366 19.1366L15 30L10.8634 19.1366L0 15L10.8634 10.8634L15 0Z"
        fill={color}
      />
    </svg>
  );
};
