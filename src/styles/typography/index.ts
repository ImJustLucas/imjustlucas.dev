import styled from "styled-components";

export const TextMegaLarge = styled.h1`
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

export const TextTitleSection = styled.h2`
  color: ${({ theme }) => theme.colors.text.contrast};
  text-align: center;
  font-family: "Roslindale Display";
  font-size: 88px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;

  @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
    font-size: 72px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
    font-size: 40px;
  }
`;

export const TextBasic = styled.p`
  color: ${({ theme }) => theme.colors.text.contrast};
  font-family: "Figtree";
  font-size: 16px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
`;
