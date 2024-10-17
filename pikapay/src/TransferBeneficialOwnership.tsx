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
  const { data: signer } = useSigner();

  const transferBeneficialOwnership = async (
    batchID: string,
    recipient: string,
    amount: number
  ) => {
    
    const PIKAPAYContractAddress = "0xf2a5CA8E05F104Fe9912c35110D267f449151c2D";

    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer!
    );

    const transferTx = await contract.transferBatchOwnership(
      Number(batchID),
      recipient,
      amount
    );

    await transferTx.wait();

    console.log("Transaction ID:", transferTx.hash);
    setTxnId(transferTx.hash);
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await transferBeneficialOwnership(batchID, recipient, Number(amount));
  };

  return (
    <Container className="font-Archivo">
      <WhiteBox>
        <div className="container mx-auto">
          <h1 className="text-2xl text-gray-800 font-bold mb-4">
            Transfer beneficial ownership
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
              className="px-4 py-2 rounded-md text-white  font-Archivo transition-colors duration-300 
              bg-gray-700 hover:bg-gray-500"
            >
              Transfer
            </button>
            {txnId && (
              <p className="mt-4">
                <a className=" font-Archivo text-gray-500 " href={"https://testnet.bttcscan.com/tx/" + txnId}>
                  TxID: {txnId.slice(0,9)+ "..." + txnId.slice(9,18)}
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
