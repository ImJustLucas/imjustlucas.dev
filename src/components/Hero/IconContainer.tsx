import styled from "styled-components";

import { StarIcon } from "@components/Icons/Star";

export const IconStarContainer: React.FC = () => {
  return (
    <IconContainer>
      <StarIcon className="star-1" size="32px" />
      <StarIcon className="star-2" size="32px" />
      <StarIcon className="star-3" size="32px" />
      <StarIcon className="star-4" size="32px" />
    </IconContainer>
  );
};

const IconContainer = styled.div`
  width: 100%;
  position: absolute;
  height: 100%;
  top: 0;

  & > svg path {
    fill: ${({ theme }) => theme.colors.text.contrast};
  }

  .star-1 {
    position: absolute;
    top: 0;
    left: 64px;
  }
  .star-2 {
    position: absolute;
    top: 50%;
    left: 15%;

    @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
      top: 70%;
    }
  }

  .star-3 {
    position: absolute;
    top: 15%;
    left: 65%;

    @media (max-width: ${({ theme }) => theme.breakpoint.tablet}) {
      left: 70%;
    }

    @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
      top: 20%;
      left: 80%;
    }
  }

  .star-4 {
    position: absolute;
    top: 40%;
    left: 85%;

    @media (max-width: ${({ theme }) => theme.breakpoint.mobile}) {
      top: 60%;
    }
  }
`;
