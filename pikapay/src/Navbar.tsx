import { useAccount } from "wagmi";
import { ConnectButton } from "./components/ConnectKit";


const Navbar = () => {
  const { status, address } = useAccount(); // Removed error from here

  return (
    <nav className="p-4">
      <div className="flex max-w-[650px] mx-auto justify-between  items-center space-x-4 p-4">


        <div className=" flex justify-center items-center">
      
          <h1 className="text-gray-700 text-2xl font-bold">PikaPay</h1>
        </div>

        {/* Right Side - User Address and Connect Wallet Button */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">
            {status === "connected"
              ? address.slice(0, 9) + "..." + address.slice(9, 15)
              : ""}
          </span>
          {/* Conditional rendering for the Connect Wallet Button */}
          {status !== "connected" && <ConnectButton />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
