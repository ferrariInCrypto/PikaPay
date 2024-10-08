import styled from "styled-components";
import { useLocation, useNavigate } from "react-router";
import { theme } from "../utils/theme";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";
import { FaQrcode } from "react-icons/fa";

const Outer = styled.div`
  font-family: "Nunito", sans-serif;
  background-color: #fff;
  user-select: none;
  border-bottom: 1px solid ${theme.neutrals["cool-grey-100"]};

  padding: 1rem 3rem;
  color: #000;

  @media only screen and (max-width: 750px) {
    padding: 1rem 1rem;
  }
`;

const Container = styled.div`
  display: flex;
`;

const LogoContainer = styled.div`
  min-width: 100px;
  display: flex;
  align-items: center;
`;

const MainNavigation = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const QR = styled(FaQrcode)`
  margin-right: 10px;
`;

const LogoImage = styled.img`
  width: 240px;
  margin-right: 4px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Right = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;

  @media only screen and (min-width: 700px) {
    .second-search-bar {
      display: none;
    }
  }
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media only screen and (max-width: 700px) {
    display: none;
  }
`;

const MobileLinks = styled.div`
  display: block;
  margin-top: 20px;

  @media only screen and (min-width: 900px) {
    display: none;
  }
`;

const LogoText = styled.span`
  font-family: Audiowide, sans-serif;
  font-size: 22px;
  font-weight: 400;
  white-space: nowrap;
`;

const MenuItem = styled.a`
  border-radius: 20px;
  padding: 12px 20px;
  font-family: "Montserrat", serif;
  font-style: normal;
  font-weight: "000";
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
  color: #333342;

  :hover {
    background-color: "#F1F4F9";
  }
`;

type MenuItemType = {
  title: string;
  path: string;
  onClick: () => void;
};

export function Header() {
  

  return (
    <>
      
    </>
  );
}
