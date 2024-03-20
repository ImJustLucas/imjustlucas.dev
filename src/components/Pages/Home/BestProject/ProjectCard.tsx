import styled from "styled-components";

export const ProjectCard: React.FC = () => {
  return (
    <ProjectCardContainer>
      <Wrapper></Wrapper>
    </ProjectCardContainer>
  );
};

const ProjectCardContainer = styled.div`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.grey[800]};
`;

const Wrapper = styled.div`
  margin: 0 auto;
  width: calc(100% - 32px);
  max-width: 1200px;
`;
