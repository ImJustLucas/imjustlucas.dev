import styled from "styled-components";

import { TextTitleSection } from "@styles/typography";

export const Contact: React.FC = () => {
  return (
    <Container>
      <TextTitleSection id="Contact">
        <span>Let&apos;s</span>
        <br />
        Contact.
      </TextTitleSection>
      <p>
        <a href="mailto:contact@imjustlucas.dev">contact@imjustlucas.dev</a>
      </p>
      <div className="sonic-container">
        <img src="/gif/sonic-dancing.gif" alt="Sonic" />
      </div>
    </Container>
  );
};

const Container = styled.div`
  padding: 80px 16px;
  margin: 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;
  position: relative;

  & > h2 {
    text-align: left;

    span {
      color: ${({ theme }) => theme.colors.grey[800]};
    }
  }

  & > p {
    font-size: 40px;
    padding-top: 24px;

    & > a {
      color: ${({ theme }) => theme.colors.grey[800]};
      text-decoration: none;
    }

    @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
      font-size: 32px;
    }

    @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
      font-size: 24px;
    }
  }

  .sonic-container {
    position: absolute;
    bottom: 25%;
    right: 0;
    width: 210px;

    & > img {
      width: 100%;
    }

    @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
      position: relative;
      margin-left: auto;
      margin-top: ${({ theme }) => theme.spacing.md};
    }
  }
`;
