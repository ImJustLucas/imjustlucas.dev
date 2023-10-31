import { FC } from "react";
import { ThemeToggleButton } from "@components/ThemeToggle";
import styled from "styled-components";

export const Header: FC = () => {
  return (
    <HeaderWrapper>
      <HeaderTitle>&gt; ImJustLucas</HeaderTitle>
      <ThemeToggleButton />
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin: 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;
  height: 80px;
  background: ${({ theme }) => theme.colors.background.primary};
  transition: background 0.3s ease-in-out;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: color 0.3s ease-in-out;
`;
