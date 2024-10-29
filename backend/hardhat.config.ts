import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

 // Optional BTTCScan API key for verification


const config: HardhatUserConfig = {
  solidity: "0.8.27",

  networks: {
    bttcTestnet: {
      url: "https://pre-rpc.bittorrentchain.io/",   // BTTC Testnet RPC URL
      chainId: 1029,                   // BTTC Testnet chain ID
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],  
    },
  },

  circom: {
    inputBasePath: "./circuits",
    ptau: "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau",
    circuits: [
      {
        name: "Transfer",
      },
    ],
  },
};

export default config;


// USDT#USDT - 0x48db5c1155836dE945fB82b6A9CF82D91AC21f16
// PikaPay#PikaPay - 