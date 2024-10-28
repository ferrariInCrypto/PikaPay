import React, { useState } from "react";
import { useAccount, useSigner } from "wagmi";
import {
  Offchain,
  SchemaEncoder,
  TypedDataSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { ERC20_ABI } from "./helpers/Erc20Abi";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";
import toast from 'react-hot-toast';

const Deposit = () => {
  const { status, address } = useAccount();
  const { data: signer } = useSigner();

  const [business, setBusiness] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [buttonInput, setButtonInput] = useState("Deposit");
  const [batch, setBatch] = useState<number | null>(null);
  const [notification, setNotification] = useState("");

  const notify = (id: any) => toast('Here is your batchId' + " : " + id);

  const eas = new Offchain({
    address: "0x0000000000000000000000000000000000000000", // Replace with actual EAS address
    chainId: 1029,
    version: "0.26",
  }, 1);

  const PIKAPAYContractAddress = "0x005e9582bAA30520ba18cd1f859A0bB6919674D3";

  const createAttestation = async (
    business: string,
    purpose: string,
    sender: string
  ) => {
    const schemaEncoder = new SchemaEncoder(
      "string business,string purpose,address sender"
    );
    const encoded = schemaEncoder.encodeData([
      { name: "business", type: "string", value: business },
      { name: "purpose", type: "string", value: purpose },
      { name: "sender", type: "address", value: sender },
    ]);

    const attestation = await eas.signOffchainAttestation({
      recipient: PIKAPAYContractAddress,
      data: encoded,
      refUID: ethers.constants.HashZero,
      revocable: true,
      expirationTime: 0,
      schema: "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
      version: 1,
      time: Math.floor(Date.now() / 1000),
    }, signer as unknown as TypedDataSigner);

    console.log("offchain attestation:", JSON.stringify(attestation));
    return JSON.stringify(attestation);
  };

  const depositFundsWithAttestation = async (
    amount: number,
    attestation: string
  ) => {
    setButtonInput("Depositing ..");

    try {
      const tokenAddress = "0x48db5c1155836dE945fB82b6A9CF82D91AC21f16";
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer!);
      const unlimitedAmount = ethers.constants.MaxUint256;
      const approveTx = await tokenContract.approve(PIKAPAYContractAddress, unlimitedAmount);
      await approveTx.wait();
      console.log("Approval transaction confirmed");
    } catch (error: any) {
      alert(error.message);
      console.log("Approval transaction failed");
    }

    try {
      const contract = new ethers.Contract(PIKAPAYContractAddress, PIKAPAY_ABI.abi, signer!);

      contract.on("BatchCreated", (
        batchId: number,
        address: string,
        attestation: string,
        amount: ethers.BigNumber
      ) => {
        console.log("BatchCreated event received:", address);
        console.log(`Batch ID: ${batchId}`, `Attestation: ${attestation}`, `Amount: ${ethers.utils.formatUnits(amount, 18)} USDT`);

        setBatch(batchId);
        setNotification(`Batch Created Successfully! Batch ID: ${batchId}`);
        setButtonInput("Deposit");
        notify(batchId);
      });

      const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
      const depositTx = await contract.createNewBatchWithAttestation(attestation, parsedAmount);
      await depositTx.wait();

      setTxnId(depositTx.hash);
      setAmount("");
      setBusiness("");
      setPurpose("");
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const attestation = await createAttestation(business, purpose, address as string);
    await depositFundsWithAttestation(Number(amount), attestation);
  };

  return (
    <div className="font-Archivo">
      <div className="max-w-[650px] mx-auto mt-10 p-9 bg-white rounded-lg shadow-[0_4px_33px_rgba(168,198,207,0.15)] box-border">
        <h1 className="text-2xl text-gray-800 font-bold mb-4">Deposit funds in the pool</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="business" className="block text-sm font-medium">Business name</label>
            <input
              type="text"
              id="business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium">Purpose of funds</label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
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
            <>
              <p className="mt-4">
                <a
                  className="font-Archivo text-gray-500"
                  href={"https://testnet.bttcscan.com/tx/" + txnId}
                >
                  TxID: {txnId.slice(0, 9) + "..." + txnId.slice(9, 18)}
                </a>
              </p>
              {notification && (
                <p className="mt-4 text-md font-Archivo text-gray-500">
                  BatchId: {batch?.toString()}
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Deposit;
