import styled from "styled-components";

import { TextTitleSection } from "@styles/typography";

export const BestProject: React.FC = () => {
  return (
    <Container>
      <TextTitleSection id="Work">My work</TextTitleSection>
    </Container>
  );
};

const Container = styled.div`
  padding: 120px 0;
`;
