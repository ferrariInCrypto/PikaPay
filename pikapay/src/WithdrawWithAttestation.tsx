import React, { useState } from "react";
import styled from "styled-components";
import { useSigner, useAccount } from "wagmi";
import { ethers } from "ethers";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";

const Container = styled.div`
  @media (max-width: 700px) {
    width: 100%;
  }
`;

const WhiteBox = styled.div`
  box-shadow: 0 4px 33px rgba(168, 198, 207, 0.15);
  background-color: #fff;
  padding: 36px;
  max-width: 650px;
  border-radius: 10px;
  margin: 40px auto 0;
  box-sizing: border-box;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const WithdrawWithAttestation = () => {
  const [batchID, setBatchID] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const { data: signer } = useSigner();
  const { address } = useAccount(); // Correct use of useAccount hook

  const [buttonInput, setButtonInput] = useState("Withdraw");

  const doWithdrawWithAttestation = async (batchID: string, amount: number) => {
    if (!signer) {
      alert("Please connect your wallet.");
      return;
    }

    const PIKAPAYContractAddress = "0x81871eB3482d29A9d7E401472C64E755f824859d";
    const contract = new ethers.Contract(PIKAPAYContractAddress, PIKAPAY_ABI.abi, signer);

    const meta = "";
    setButtonInput("Withdrawing...");

    // Parse amount (assuming USDT has 6 decimals)
    const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);

    try {
      // Check if the user has enough balance
      const balance = await contract.beneficiaryBalances(batchID, address);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);

      console.log("Beneficiary Balance:", formattedBalance);

      if (balance.lt(parsedAmount)) {
        throw new Error("Insufficient balance for withdrawal.");
      }

      // Listen for the AttestedWithdrawal event
      contract.once(
        "AttestedWithdrawal",
        (batchId: number, beneficiary: string, amount: ethers.BigNumber, attestation: string, metadata: string) => {
          console.log(`AttestedWithdrawal event received:`);
          console.log(`Batch ID: ${batchId}, Attestation: ${attestation}`);
          alert(`Batch ID: ${batchId}, Attestation: ${attestation}`);
        }
      );

      // Call withdrawWithAttestationProof
      const withdrawTx = await contract.withdrawWithAttestationProof(Number(batchID), parsedAmount, meta);

      await withdrawTx.wait(); // Ensure the transaction is mined

      console.log("Transaction ID:", withdrawTx.hash);
      setTxnId(withdrawTx.hash);
      setButtonInput("Withdraw");
    } catch (error: any) {
      console.error("Error: ", error);
      alert("Error: " + error.message);
      setButtonInput("Withdraw");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!batchID || !amount) {
      alert("Please provide both Batch ID and Amount.");
      return;
    }
    await doWithdrawWithAttestation(batchID, Number(amount));
  };

  return (
    <Container className="font-Archivo">
      <WhiteBox>
        <div className="container mx-auto">
          <h1 className="text-2xl text-gray-800 font-bold mb-4">
            Withdraw with attestation
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="batchID" className="block text-sm font-medium">
                Batch ID
              </label>
              <input
                type="text"
                id="batchID"
                value={batchID}
                onChange={(e) => setBatchID(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white font-Archivo transition-colors duration-300 bg-gray-700 hover:bg-gray-500"
            >
              {buttonInput}
            </button>
            {txnId && (
              <p className="mt-4">
                <a
                  className="font-Archivo text-gray-500"
                  href={"https://testnet.bttcscan.com/tx/" + txnId}
                >
                  TxID: {txnId.slice(0, 9) + "..." + txnId.slice(9, 18)}
                </a>
              </p>
            )}
          </form>
        </div>
      </WhiteBox>
    </Container>
  );
};

export default WithdrawWithAttestation;
