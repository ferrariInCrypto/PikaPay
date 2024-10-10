import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const PRIVATE_KEY = "8319063a89d86ebd05ef5ed9265f2a7d9c2905f00187cb62d1cba295cd935e4b"; // Add your wallet private key to the .env file
 // Optional BTTCScan API key for verification


const config: HardhatUserConfig = {
  solidity: "0.8.27",

  networks: {
    bttcTestnet: {
      url: "https://pre-rpc.bittorrentchain.io/",   // BTTC Testnet RPC URL
      chainId: 1029,                   // BTTC Testnet chain ID
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],  // Your private key from the .env file
    },
  },
};

export default config;
