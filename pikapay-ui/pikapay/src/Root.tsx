import { Header } from "./components/Header";
import { Outlet } from "react-router";
import { createClient, WagmiConfig } from "wagmi";
import * as chains from "wagmi/chains";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import "./App.css";
import invariant from "tiny-invariant";

;

type Chain = {
  readonly id: number;
  readonly network: string;
  readonly name: string;
  readonly nativeCurrency: {
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
  };
  readonly rpcUrls: any;
  readonly blockExplorers: any;
  // readonly contracts: any;
};

type ChainConfig = {
  chainName: string;
  chain: Chain;
};

// Define BTTC Testnet Chain Configuration
const bttcTestnetChain: Chain = {
  id: 1029, // BTTC Testnet Chain ID
  network: "bttc-testnet",
  name: "BitTorrent Chain Testnet",
  nativeCurrency: {
    name: "BitTorrent",
    symbol: "BTT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://test-rpc.bt.io"] }, // Testnet RPC URL
  },
  blockExplorers: {
    default: { name: "BTTCScan Testnet", url: "https://testnet.bttcscan.com" },
  },
};

const allChains: ChainConfig[] = [
  {
    chainName: "polygonZkEvm",
    chain: chains.polygonZkEvm,
  },
  {
    chainName: "sepolia",
    chain: chains.sepolia,
  },
  {
    chainName: "bttc-testnet", // Add BTTC Testnet
    chain: bttcTestnetChain,
  },
];

const usableChains = allChains
  // .filter((chain) => chain.chainName === activeChainConfig!.chainName)
  .map((chain) => chain.chain);

console.log('usableChains:', usableChains);

const client = createClient(
  getDefaultClient({
    appName: "PikaPay",
    chains: usableChains,
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
          <Header />
          <Outlet />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
