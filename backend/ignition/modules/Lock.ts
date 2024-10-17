// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


module.exports = buildModule("USDT", (m) => {

   const usdt = m.contract("USDT");
  return { usdt};

});

module.exports = buildModule("PikaPay", (m) => {

  const pikaPay = m.contract("PikaPay");
 return { pikaPay};

});

