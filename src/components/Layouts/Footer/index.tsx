import styled from "styled-components";

import { FC } from "react";

import { SocialBar } from "./SocialBar";

export const Footer: FC = () => {
  return (
    <FooterWrapper>
      <SocialBar />
      <span>•</span>
      <span>Made with 💙 by ImJustLucas</span>
    </FooterWrapper>
  );
};

const FooterWrapper = styled.footer`
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.contrast};

  svg path {
    fill: ${({ theme }) => theme.colors.text.contrast};
  }
`;
