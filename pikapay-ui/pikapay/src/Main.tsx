import React, { useState } from "react";
import styled from "styled-components";
import { useAccount, useSigner } from "wagmi";
import {
  EAS,
  Offchain,
  SchemaEncoder,
  TypedDataSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { CustomConnectButton } from "./components/ui/CustomConnectKit";
import { ERC20_ABI } from "./erc20-abi";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";

const Title = styled.div`
  color: #163a54;
  font-size: 22px;
  font-family: Montserrat, sans-serif;
`;

const Container = styled.div`
  @media (max-width: 700px) {
    width: 100%;
  }
`;

const MetButton = styled.div`
  border-radius: 10px;
  border: 1px solid #cfb9ff;
  background: #333342;
  width: 100%;
  padding: 20px 10px;
  box-sizing: border-box;
  color: #fff;
  font-size: 18px;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  cursor: pointer;
`;

const SubText = styled(Link)`
  display: block;
  cursor: pointer;
  text-decoration: underline;
  color: #ababab;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  position: relative;
  height: 90px;
`;

const InputBlock = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 10px;
  border: 1px solid rgba(19, 30, 38, 0.33);
  background: rgba(255, 255, 255, 0.5);
  color: #131e26;
  font-size: 18px;
  font-family: Chalkboard, sans-serif;
  padding: 20px 10px;
  text-align: center;
  margin-top: 12px;
  box-sizing: border-box;
  width: 100%;
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

const eas = new Offchain(
  {
    address: "0x0000000000000000000000000000000000000000",
    chainId: 1029,
    version: "0.26",
  },
  1
);

function Main() {
  const { status, address } = useAccount();
  const { data: signer } = useSigner();

  const [business, setBusiness] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");

  const createAttestation = async (
    business: string,
    purpose: string,
    sender: string
  ) => {
    // your actual implementation of createAttestation should go here
    const schemaEncoder = new SchemaEncoder(
      "string business,string purpose,address sender"
    );
    const encoded = schemaEncoder.encodeData([
      { name: "business", type: "string", value: "test business" },
      { name: "purpose", type: "string", value: "test purpose" },
      {
        name: "sender",
        type: "address",
        value: "0xC16BA0330334B747582D9B7D2d89bdde6008E4a1",
      },
    ]);

    console.log("signing");
    const attestation = await eas.signOffchainAttestation(
      {
        recipient: "0x0000000000000000000000000000000000000000",
        data: encoded,
        refUID: ethers.constants.HashZero,
        revocable: true,
        expirationTime: 0,
        schema:
          "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
        version: 1,
        time: Math.floor(Date.now() / 1000),
      },
      signer as unknown as TypedDataSigner
    );

    console.log("offchain attestation:", JSON.stringify(attestation));
    return JSON.stringify(attestation);
  };

  const depositFunds = async (amount: number, attestation: string) => {
    try {
        const tokenAddress = "0xEbBd9625d36A4C91B028846C6faDE5dBfDb2e458";
        const PIKAPAYContractAddress =
            "0xA2552C2f43608ADAAEf8D23d90044C482640611F";

        const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            signer!
        );

        // Approve unlimited spending
        const unlimitedAmount = ethers.constants.MaxUint256;
        const approveTx = await tokenContract.approve(PIKAPAYContractAddress, unlimitedAmount);
        await approveTx.wait(); // Wait for approval to be mined

        // Set up the contract to listen for events
        const contract = new ethers.Contract(
            PIKAPAYContractAddress,
            PIKAPAY_ABI.abi,
            signer!
        );

        // Listening for the Deposit event
        contract.once("Deposit", (batchId: number, attestation: string, amount: ethers.BigNumber) => {
            console.log("Deposit Event:");
            console.log(`Batch ID: ${batchId}`, `Attestation: ${attestation}`, `Amount: ${ethers.utils.formatUnits(amount, 6)} USDT`);
            alert(`Batch ID: ${batchId}`);
        });

        console.log("depositing", amount, attestation);

        // Call the deposit function on the smart contract
        const depositTx = await contract.deposit(attestation, amount);
        console.log("Transaction ID:", depositTx.hash);
        setTxnId(depositTx.hash);
        
        // Wait for the transaction to be mined
        await depositTx.wait(); // This will ensure that the Deposit event is emitted

    } catch (error) {
        console.error("Error depositing funds:", error);
    }
};

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const attestation = await createAttestation(
      business,
      purpose,
      address as string
    );
    depositFunds(Number(amount), attestation);
  };

  if (status !== "connected") {
    return (
      <Container>
        <div className="flex justify-center font-Archivo items-center min-h-screen font-fira-sans-condensed-thin">
          <div className="bg-white rounded-md shadow-md p-16 flex flex-col items-center space-y-4">
            <h1 className="text-center text-2xl   ">Welcome to PikaPay</h1>
            <div className="h-3" />

            <CustomConnectButton />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="font-Archivo">

      <WhiteBox>


        <div className="container mx-auto ">
          <h1 className="text-xl font-bold mb-4">Deposit funds into Pika pool</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="business" className="block text-sm font-medium">
                Business
              </label>
              <input
                type="text"
                id="business"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium">
                Purpose
              </label>
              <input
                type="text"
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
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
              className="bg-transparent bg-gray-900 text-gray-300 font-semibold hover:text-white py-2 px-4 border border-gray-800hover:border-transparent rounded shadow-md transition duration-300 ease-in-out"
            >
              Submit
            </button>
            {txnId && (
              <p className="mt-4">
                <a href={"https://testnet.bttcscan.com/tx/" + txnId}>
                  Transaction ID: {txnId}
                </a>
              </p>
            )}
          </form>
          <div className="h-8" />
          <TransferBeneficialOwnership />
          <div className="h-8" />
          <WithdrawWithAttestation />
        </div>
      </WhiteBox>
    </Container>
  );
}

const TransferBeneficialOwnership = () => {
  const [batchID, setBatchID] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const { data: signer } = useSigner();

  const transferBeneficialOwnership = async (
    batchID: string,
    recipient: string,
    amount: number
  ) => {
    const PIKAPAYContractAddress =
      "0xA2552C2f43608ADAAEf8D23d90044C482640611F";

    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer!
    );

    const depositTx = await contract.transferBeneficialOwnership(
      Number(batchID),
      recipient,
      amount
    );
    console.log("Transaction ID:", depositTx.hash);
    setTxnId(depositTx.hash);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await transferBeneficialOwnership(batchID, recipient, Number(amount));
  };

  return (
    <div className="container font-Archivo mx-auto">
      <h1 className="text-xl font-bold mb-4">Transfer beneficial ownership</h1>
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
          className="bg-transparent bg-gray-900 text-gray-300 font-semibold hover:text-white py-2 px-4 border border-gray-800hover:border-transparent rounded shadow-md transition duration-300 ease-in-out"
        >
          Submit
        </button>
        {txnId && (
          <p className="mt-4">
            <a href={"https://testnet.bttcscan.com/tx/" + txnId}>
              Transaction ID: {txnId}
            </a>
          </p>
        )}
      </form>
    </div>
  );
};

const WithdrawWithAttestation = () => {
  const [batchID, setBatchID] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const { data: signer } = useSigner();

  const doWithdrawWithAttestation = async (batchID: string, amount: number) => {
    const PIKAPAYContractAddress =
      "0xA2552C2f43608ADAAEf8D23d90044C482640611F";

    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer!
    );

    const meta = "";

    const depositTx = await contract.withdrawWithAttestation(
      Number(batchID),
      amount,
      meta
    );
    console.log("Transaction ID:", depositTx.hash);
    setTxnId(depositTx.hash);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await doWithdrawWithAttestation(batchID, Number(amount));
  };

  return (
    <div className="container mx-auto font-Archivo">
      <h1 className="text-xl font-bold mb-4">Withdraw with attestation</h1>
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
          className="bg-transparent bg-gray-900 text-gray-300 font-semibold hover:text-white py-2 px-4 border border-gray-800hover:border-transparent rounded shadow-md transition duration-300 ease-in-out"
        >
          Submit
        </button>
        {txnId && (
          <p className="mt-4">
            <a href={"https://testnet.bttcscan.com/tx/" + txnId}>
              Transaction ID: {txnId}
            </a>
          </p>
        )}
      </form>
    </div>
  );
};

export default Main;
