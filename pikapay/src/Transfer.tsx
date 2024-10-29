import React, { useState } from "react";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";

const TransferBeneficialOwnership = () => {
  const [notification, setNotification] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [buttonInput, setButtonInput] = useState("Transfer");
  const [batchID, setBatchID] = useState("");
  const { data: signer } = useSigner();

  const transferBeneficialOwnership = async (
    batchID: string,
    recipient: string,
    amount: number
  ) => {
    const PIKAPAYContractAddress = "0x005e9582bAA30520ba18cd1f859A0bB6919674D3";

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
        ethers.utils.parseUnits(amount.toString(), 18) // Assuming 18 decimals for token
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

    } catch (error: any) {
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
    <div className="font-Archivo">
      <div className="max-w-[650px] mx-auto mt-10 p-9 bg-white rounded-lg shadow-[0_4px_33px_rgba(168,198,207,0.15)] box-border">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Transfer Ownership Rights
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="batchID" className="block text-sm font-medium">
              Group ID
            </label>
            <input
              type="text"
              id="batchID"
              value={batchID}
              onChange={(e) => setBatchID(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium">
              Recipient Address
              
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium">
            Amount to Transfer
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-gray-700 text-white transition duration-300 hover:bg-gray-500"
          >
            {buttonInput}
          </button>

          <p className="mt-4 text-gray-500"> Note : This transfer would be using zksnarks to ensure privacy preservations. </p>
          {txnId && (
            <p className="mt-4">
              <a
                className="text-gray-500"
                href={`https://testnet.bttcscan.com/tx/${txnId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                TxID: {txnId.slice(0, 9) + "..." + txnId.slice(-9)}
              </a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TransferBeneficialOwnership;
