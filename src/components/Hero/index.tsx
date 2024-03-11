import { TextBasic } from "@styles/typography";
import Image from "next/image";
import styled from "styled-components";

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <PreTitle>Yoooo, I&apos;mm</PreTitle>
      <Title>Lucas</Title>
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
          style={{ width: "100%", height: "auto", maxWidth: "615px" }}
        />
      </AvatarContainer>
    </HeroContainer>
  );
};

const HeroContainer = styled.div`
  margin: calc(8px * 10) auto 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.contrast};
  text-align: center;
  font-family: "Roslindale Display";
  font-size: 96px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.md};
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
  }

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Description = styled(TextBasic)`
  text-align: center;
  max-width: 500px;
  margin: 0 auto 64px auto;
`;
