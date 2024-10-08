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
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-md transition duration-300 ease-in-out"
          >
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
