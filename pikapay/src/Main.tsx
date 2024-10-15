// Main.tsx
import React, { useState } from "react";
import NavButton from "./NavButton"; // Ensure the correct path to your NavButton component
import Deposit from "./Deposit";
import TransferBeneficialOwnership from "./TransferBeneficialOwnership";
import WithdrawWithAttestation from "./WithdrawWithAttestation";

const Main: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>("Deposit"); // Default active component

  return (
    <div>
      <nav className="flex justify-center items-center space-x-4 p-4 mt-8">
        {" "}
        {/* Flexbox for layout */}
        <NavButton
          active={activeComponent === "Deposit"}
          onClick={() => setActiveComponent("Deposit")}
        >
          Deposit Payroll
        </NavButton>
        <NavButton
          active={activeComponent === "TransferBeneficialOwnership"}
          onClick={() => setActiveComponent("TransferBeneficialOwnership")}
        >
          Transfer Beneficial Ownership
        </NavButton>
        <NavButton
          active={activeComponent === "WithdrawWithAttestation"}
          onClick={() => setActiveComponent("WithdrawWithAttestation")}
        >
          Withdraw with Attestation
        </NavButton>
      </nav>
      {/* Additional component rendering based on activeComponent */}
      <div className="">
        {activeComponent === "Deposit" && (
          <div>
            <Deposit />
          </div>
        )}
        {activeComponent === "TransferBeneficialOwnership" && (
          <div>
            <TransferBeneficialOwnership />
          </div>
        )}
        {activeComponent === "WithdrawWithAttestation" && (
          <div>
            <WithdrawWithAttestation />
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
