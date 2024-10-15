import { ConnectKitButton } from "connectkit";
import styled from "styled-components";
import { ButtonBase } from "../../styles/buttons";
import { theme } from "../../utils/theme";

const StyledButton = styled.button`
  ${ButtonBase};

  min-width: 150px;
  background-color: ${theme.neutrals["cool-grey-050"]};
  border: 1px solid ${theme.neutrals["cool-grey-100"]}
  padding: 10px 25px;

  transition: 200ms ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 10px -4px ${theme.primary["indigo-100"]};
  }
  &:active {
    transform: translateY(-3px);
    box-shadow: 0 6px 10px -4px ${theme.primary["indigo-100"]};
  }
`;

export const CustomConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <button
          onClick={show}
          className="px-4 py-2 rounded-md text-white  font-Archivo transition-colors duration-300 
          bg-gray-700 hover:bg-gray-500"
      >
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
