import { Header } from "./components/Header";
import { Outlet } from "react-router-dom"; // Corrected import for Outlet
import { createClient, WagmiConfig } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import "./App.css";
import Navbar from "./Navbar";

// Define BTTC Testnet Chain Configuration
const bttcTestnetChain = {
  id: 1029, // BTTC Testnet Chain ID
  network: "BTTC Testnet",
  name: "BTTC Testnet",
  nativeCurrency: {
    name: "BitTorrent",
    symbol: "BTT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://pre-rpc.bittorrentchain.io/"] }, // Testnet RPC URL
    public: { http: ["https://pre-rpc.bittorrentchain.io/"] }, // Added 'public' to satisfy type requirements
  },
  blockExplorers: {
    default: { name: "BitTorrent Chain Donau", url: "https://testscan.bittorrentchain.io/" },
  },
};

// Create client with BTTC Testnet Chain configuration
const client = createClient(
  getDefaultClient({
    appName: "PikaPay",
    chains: [bttcTestnetChain], // Wrapped in an array
  })
);

export function Root() {
  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider
          theme={"soft"}
          customTheme={{
            "--ck-font-family": '"Nunito", sans-serif',
          }}
          options={{
            hideQuestionMarkCTA: true,
            hideTooltips: true,
          }}
        >
          <Navbar />
          <Header />
          <Outlet />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
