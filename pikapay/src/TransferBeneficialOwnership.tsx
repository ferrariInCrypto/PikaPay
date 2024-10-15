import React, { useState } from "react";
import styled from "styled-components";
import { useAccount, useSigner } from "wagmi";
import { Signer, ethers } from "ethers";
import PIKAPAY_ABI from "./artifacts/contracts/PikaPay.sol/PikaPay.json";
import { Link } from "react-router-dom";

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
    const PIKAPAYContractAddress = "0xE1A5a5Da4bDab7a052c66BFC91Ee705ccc90B21A";

    const contract = new ethers.Contract(
      PIKAPAYContractAddress,
      PIKAPAY_ABI.abi,
      signer!
    );

    const depositTx = await contract.transferBatchOwnership(
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
              Submit
            </button>
            {txnId && (
              <p className="mt-4">
                <a
                  className="underline font-Archivo text-gray-500 underline-offset-1"
                  href={"https://testnet.bttcscan.com/tx/" + txnId}
                >
                  TxID: https://testnet.bttcscan.com/tx/{txnId.slice(0, 9)}
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
