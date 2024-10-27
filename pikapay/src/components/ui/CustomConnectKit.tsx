import { ConnectKitButton } from "connectkit";


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
