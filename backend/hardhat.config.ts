import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const PRIVATE_KEY = "baced1297f569a8e02962b7618c4ce6fc9bff2fd394849e0249175608a2597ae"; 
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


// usdt 0x683A59A90E14216b70057d95C243b118819f4000