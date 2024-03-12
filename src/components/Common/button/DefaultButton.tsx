import styled from "styled-components";

import Link from "next/link";

type DefaultButtonProps = {
  children: string;
  onClick?: () => void;
  type: "default" | "primary" | "danger";
  bordered?: boolean;
  icon?: boolean;
  href?: string;
};

export const DefaultButton: React.FC<DefaultButtonProps> = ({
  children,
  onClick,
  type = "default",
  bordered,
  icon = true,
  href,
}) => {
  return (
    <Button
      as={href ? Link : "button"}
      onClick={onClick}
      $type={type}
      $bordered={bordered}
      href={href}
    >
      {children}
      {icon && <i className="ri-arrow-right-up-line" />}
    </Button>
  );
};

const Button = styled.div<{
  $type: "default" | "primary" | "secondary" | "danger";
  $bordered?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px 24px;
  font-size: 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;

  ${({ $type, theme }) => {
    switch ($type) {
      case "primary":
        return `
          background-color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
      case "danger":
        return `
          background-color: ${theme.colors.danger};
          border: 2px solid ${theme.colors.primary};
          color: ${theme.colors.white};
        `;
      default:
        return `
          background-color: ${theme.colors.dark};
          border: 2px solid ${theme.colors.dark};
          color: ${theme.colors.white};
        `;
    }
  }}

  ${({ $bordered, $type, theme }) => {
    if ($bordered) {
      return `
          border: 2px solid ${theme.colors[$type]};
          background-color: ${theme.colors.white};
          color: ${theme.colors.dark};
        `;
    }
  }}

  i {
    transition: 0.3s ease-in-out;
  }

  &:hover {
    i {
      transform: rotate(45deg);
    }
  }
`;
