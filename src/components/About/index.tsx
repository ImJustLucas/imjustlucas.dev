import styled from "styled-components";

import { TextBasic, TextTitleSection } from "@styles/typography";

export const AboutMeCard: React.FC = () => {
  return (
    <AboutMeCardContainer>
      <TextTitleSection id="About">About me</TextTitleSection>
      <TextBasic>
        Bonjour! I&apos;m a software developer based in the heart of Paris,
        France, with a focus on crafting high-quality websites and applications.
      </TextBasic>
      <TextBasic>
        I&apos;m truly passionate about what I do, whether it&apos;s a fun side
        project or a game-changer in the industry. Enjoy your stay, and I hope
        you stumble upon something useful or have a good laugh while exploring!
        💖
      </TextBasic>
      <TextBasic>
        Founder of multiple project & application, but i can&apos;t tell more
        for now 😿
      </TextBasic>
    </AboutMeCardContainer>
  );
};

const AboutMeCardContainer = styled.div`
  border-radius: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 32px 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: -${({ theme }) => theme.spacing.md};
  min-width: 650px;
  max-width: 850px;
  position: relative;
  z-index: 2;

  & > p {
    text-align: center;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
    min-width: unset;
    max-width: 600px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
    min-width: unset;
    width: 300px;
    padding: 16px;
  }
`;
