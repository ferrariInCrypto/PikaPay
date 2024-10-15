import { useAccount } from "wagmi";
import { CustomConnectButton } from "./components/ui/CustomConnectKit";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { status, address } = useAccount(); // Removed error from here
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "disconnected") {
      setErrorMessage("Failed to load account information. Please connect your wallet.");
    } else {
      setErrorMessage(null); // Clear error message when connected
    }
  }, [status]);

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-evenly items-center">
        {/* Left Side - Heading */}
        <h1 className="text-gray-700 text-2xl font-bold">PikaPay</h1>

        {/* Right Side - User Address and Connect Wallet Button */}
        <div className="flex items-center space-x-4">
          {/* Error Handling */}
          {errorMessage ? (
            <span className="text-red-500">{errorMessage}</span>
          ) : (
            <>
              <span className="text-gray-400">
                {status === "connected" ? address.slice(0,9) + "..."  + address.slice(9,18): "Not connected"}
              </span>
              {/* Conditional rendering for the Connect Wallet Button */}
              {status !== "connected" && <CustomConnectButton />}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
