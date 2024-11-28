import { Outlet } from "react-router-dom"; // Corrected import for Outlet
import { createClient, WagmiConfig } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import "./App.css";
import Navbar from "./Navbar";


const BTTCMainnet = {
  id: 199, // BTTC Testnet Chain ID
  network: "BitTorrent Chain Mainnet",
  name: "BitTorrent Chain Mainnet",
  nativeCurrency: {
    name: "BitTorrent",
    symbol: "BTT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.bittorrentchain.io"] }, //  RPC URL
    public: { http: ["https://rpc.bittorrentchain.io"] }, // Added 'public' to satisfy type requirements
  },
  blockExplorers: {
    default: { name: "BitTorrent Chain Mainnet", url: "https://bittorrentchain.io/" },
  },
};

// Create client with BTTC Testnet Chain configuration
const client = createClient(
  getDefaultClient({
    appName: "PikaPay",
    chains: [BTTCMainnet], // Wrapped in an array
  })
);

export function Root() {
  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider
          theme={"soft"}
          customTheme={{
            "--ck-font-family": '"Titillium-Web", sans-serif',
          }}
          options={{
            hideQuestionMarkCTA: true,
            hideTooltips: true,
          }}
        >
          <Navbar />  
          <Outlet />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
