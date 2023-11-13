import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import Image from "next/image";
import styled from "styled-components";

export default function Home() {
  return (
    <>
      <Header />
      <HeroContainer>
        <DevInfo>
          <PreTitle>one, two, three</PreTitle>
          <Title>Yooo, I&apos;m Lucas</Title>
          <Description>
            I&apos;m a software developer based in the heart of Paris, France,
            with a focus on crafting high-quality websites and applications.
          </Description>
        </DevInfo>
        <AvatarContainer>
          <Image
            src="/chibi-avatar-transparent-without-border.png"
            alt="Lucas"
            width={0}
            height={0}
            sizes="100vw"
            priority
            style={{ width: "100%", height: "auto", maxWidth: "300px" }}
          />
        </AvatarContainer>
      </HeroContainer>
      <Footer />
    </>
  );
}

const HeroContainer = styled.div`
  margin: 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    height: auto;
    justify-content: flex-start;
    gap: 32px;
  }
`;

const DevInfo = styled.div`
  width: 50%;
  padding-left: 32px;

  @media (max-width: 768px) {
    width: 100%;
    align-items: center;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 32px;

  img {
    width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: all 0.3s;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const PreTitle = styled.h2`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.contrast};
  transition: all 0.3s;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  width: 60%;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
