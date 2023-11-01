import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import Image from "next/image";
import styled from "styled-components";

export default function Home() {
  return (
    <>
      <Header />
      <HeroContainer>
        <div className="dev--info">
          <PreTitle>one, two, three</PreTitle>
          <Title>Yooo, I&apos;m Lucas</Title>
          <p>
            I&apos;m a software developer based in the heart of Paris, France,
            with a focus on crafting high-quality websites and applications.
          </p>
        </div>
        <AvatarContainer>
          <Image
            src="/chibi-avatar-transparent.png"
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
  width: calc(100% - 64px);
  height: calc(100vh - 160px);
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

const AvatarContainer = styled.div`
  width: 50%;

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
