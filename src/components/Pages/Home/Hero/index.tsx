import styled from "styled-components";

import Image from "next/image";

import { TextBasic, TextMegaLarge } from "@styles/typography";

import { IconStarContainer } from "./IconContainer";

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <PreTitle>Yoooo, I&apos;m</PreTitle>
      <TextMegaLarge>Lucas</TextMegaLarge>
      <Description>
        I&apos;m a software developer based in the heart of Paris, France, with
        a focus on crafting high-quality websites and applications.
      </Description>
      <AvatarContainer>
        <Image
          src="/chibi-avatar-transparent-without-border.png"
          alt="Lucas"
          width={0}
          height={0}
          sizes="100vw"
          priority
        />
      </AvatarContainer>
      <IconStarContainer />
    </HeroContainer>
  );
};

const HeroContainer = styled.div`
  margin: calc(8px * 10) auto 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;
  position: relative;
  z-index: 1;
`;

const PreTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.contrast};
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: auto;
    max-width: 615px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
    img {
      max-width: 500px;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
    img {
      max-width: 280px;
    }
  }
`;

const Description = styled(TextBasic)`
  text-align: center;
  max-width: 500px;
  margin: 0 auto 64px auto;
`;
