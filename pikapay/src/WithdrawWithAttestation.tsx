import React, { useState } from "react";
import { useSigner, useAccount } from "wagmi";
import { ethers } from "ethers";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";

const WithdrawWithAttestation = () => {
  const [batchID, setBatchID] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [rec, setRec] = useState("");
  const [buttonInput, setButtonInput] = useState("Withdraw wP");
  const [attest, setAttest] = useState("");

  const doWithdrawWithAttestation = async () => {
    if (!signer) {
      alert("Please connect your wallet.");
      return;
    }

    const PIKAPAYContractAddress = "0x545e659C285744239A64112821Ff9bAEFcBE201F";
    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer
    );
    const meta = "";
    setButtonInput("Withdrawing...");

    contract.on(
      "AttestedWithdrawal",
      (
        batchId: number,
        address: string,
        amount: ethers.BigNumber,
        attestation: string,
        metadata: string
      ) => {
        setAttest(attestation);
        console.log(
          `Batch ID: ${batchId}`,
          `Attestation: ${attestation}`,
          `Amount: ${ethers.utils.formatUnits(amount, 18)} USDT`
        );

        alert(attestation);

        contract.removeAllListeners("AttestedWithdrawal");
      }
    );

    // Parse amount (assuming USDT has 18 decimals)
    const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);

    try {
      // Call withdrawWithAttestationProof
      const withdrawTx = await contract.withdrawWithAttestation(
        Number(batchID),
        parsedAmount,
        meta
      );
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
    await doWithdrawWithAttestation();
  };

  return (
    <div className="font-Archivo">
      <div className="max-w-[650px] mx-auto mt-10 p-9 bg-white rounded-lg shadow-[0_4px_33px_rgba(168,198,207,0.15)] box-border">
        <h1 className="text-2xl text-gray-800 font-bold mb-8">
          Withdraw funds
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="batchID" className="block text-sm font-medium">
              Your Group ID
            </label>
            <input
              type="text"
              id="batchID"
              value={batchID}
              onChange={(e) => setBatchID(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="batchID" className="block text-sm font-medium">
              Address (Optional)
            </label>
            <input
              type="text"
              id="batchID"
              value={rec}
              onChange={(e) => setRec(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium">
              Amount to withdraw
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-start gap-x-2 items-center">
            <button
              onClick={doWithdrawWithAttestation}
              type="submit"
              className="px-4 py-2 rounded-md text-white transition duration-300 bg-gray-700 hover:bg-gray-500"
            >
              {buttonInput}
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white transition duration-300 bg-gray-700 hover:bg-gray-500"
            >
              withdraw wA
            </button>
          </div>

          {txnId && (
            <p className="mt-4">
              <a
                className="text-gray-500"
                href={`https://bttcscan.com/tx/${txnId}`}
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

export default WithdrawWithAttestation;
