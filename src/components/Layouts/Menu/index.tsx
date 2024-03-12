import styled from "styled-components";

import Image from "next/image";
import Link from "next/link";

export const Menu: React.FC = () => {
  return (
    <MenuWrapper>
      <Image
        src="/imjustlucas-avatar/chibi-avatar-64x64.png"
        alt="Home"
        width={35}
        height={35}
      />
      <MenuItem href={"#Header"}>Me</MenuItem>
      <MenuItem href={"#About"}>About</MenuItem>
      <MenuItem href={"#Work"}>Work</MenuItem>
      <MenuItem href={"#Contact"}>Contact</MenuItem>
    </MenuWrapper>
  );
};

const MenuWrapper = styled.menu`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  transition: all 0.3s;
`;

const MenuItem = styled(Link)`
  color: ${({ theme }) => theme.colors.gray[700]};

  &:hover {
    color: ${({ theme }) => theme.colors.gray[900]};
  }
`;
