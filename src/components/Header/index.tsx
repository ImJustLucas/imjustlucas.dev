import styled from "styled-components";

import { FC } from "react";

import { Menu } from "@components/Menu";
import { ThemeToggleButton } from "@components/ThemeToggle";

export const Header: FC = () => {
  return (
    <HeaderWrapper id="Header">
      <TitleContainer>
        <HeaderTitle>&gt; ImJustLucas</HeaderTitle>
      </TitleContainer>
      <MenuContainer>
        <Menu />
      </MenuContainer>
      <ThemeToggleContainer>
        <ThemeToggleButton />
      </ThemeToggleContainer>
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

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const MenuContainer = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: color 0.3s ease-in-out;
`;
