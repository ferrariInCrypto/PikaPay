import React, { useState } from "react";
import styled from "styled-components";
import { useSigner } from "wagmi";
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

const TransferBeneficialOwnership = () => {
  const [batchID, setBatchID] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [buttonInput, setButtonInput] = useState("Transfer");
  const { data: signer } = useSigner();

  const transferBeneficialOwnership = async (
    batchID: string,
    recipient: string,
    amount: number
  ) => {
    const PIKAPAYContractAddress = "0x81871eB3482d29A9d7E401472C64E755f824859d";

    if (!signer) {
      alert("Please connect your wallet first");
      return;
    }

    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer
    );

    try {
      setButtonInput("Transferring...");

      const transferTx = await contract.transferBatchOwnership(
        Number(batchID),
        recipient,
        ethers.utils.parseUnits(amount.toString(), 18) // Assuming 6 decimals for token
      );

      await transferTx.wait();

      setTxnId(transferTx.hash);
      setButtonInput("Transfer");

      // Listen for the OwnershipTransferred event
      contract.once(
        "OwnershipTransferred",
        (batchId, previousOwner, newOwner, transferredAmount) => {
          console.log(
            `Ownership Transferred: Batch ID ${batchId}, from ${previousOwner} to ${newOwner}, amount: ${transferredAmount.toString()}`
          );
          alert(`Ownership Transferred successfully! Tx ID: ${transferTx.hash}`);
        }
      );
    } catch (error : any) {
      console.error("Transfer Error: ", error);
      alert("Transfer failed: " + error.message);
      setButtonInput("Transfer");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!batchID || !recipient || !amount) {
      alert("Please fill in all the fields.");
      return;
    }
    await transferBeneficialOwnership(batchID, recipient, Number(amount));
  };

  return (
    <Container className="font-Archivo">
      <WhiteBox>
        <div className="container mx-auto">
          <h1 className="text-2xl text-gray-800 font-bold mb-4">
            Transfer Beneficial Ownership
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
              <label htmlFor="recipient" className="block text-sm font-medium">
                Recipient
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
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
              className="px-4 py-2 rounded-md text-white font-Archivo transition-colors duration-300 
              bg-gray-700 hover:bg-gray-500"
            >
              {buttonInput}
            </button>
            {txnId && (
              <p className="mt-4">
                <a
                  className="font-Archivo text-gray-500"
                  href={"https://testnet.bttcscan.com/tx/" + txnId}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TxID: {txnId.slice(0, 9) + "..." + txnId.slice(-9)}
                </a>
              </p>
            )}
          </form>
        </div>
      </WhiteBox>
    </Container>
  );
};

export default TransferBeneficialOwnership;
