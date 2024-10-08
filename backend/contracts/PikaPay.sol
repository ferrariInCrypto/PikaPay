// SPDX-License-Identifier: UNLICENSED
// Written by: trevor@tk.co

pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract PikaFractionalAttestationToken is ERC20 {
  PikaPay public pikaPay;
  uint256 public batchId;

  constructor(PikaPay _PikaPay, uint256 _batchId, uint256 _supply) ERC20(string.concat("PikaPay Batch #", Strings.toString(_batchId)), "SFAT") {
    PikaPay = _pikaPay;
    batchId = _batchId;
    _mint(msg.sender, _supply);
  }

  function _beforeTokenTransfer(address, address, uint256) internal view  {
    require(msg.sender == address(pikaPay), "Only PikaPay can transfer PikaFractionalAttestationToken");
  }
}

contract PikaPay {
  struct Batch {
    uint256 batchId;
    PikaFractionalAttestationToken PikaFractionalAttestationToken;
    string attestation;
    uint256 totalAmount;
    uint256 unwithdrawnAmount;
  }

  uint256 public numberOfBatches = 0;
  mapping(uint256 => Batch) public batches;
  mapping(uint256 => mapping(address => uint256)) public beneficiaryBalance;

  event Deposit(uint256 batchId, string attestation, uint256 amount);

  event AttestedWithdrawal(uint256 batchId, address receiver, uint256 amount, string attestation, string meta);

  event PrivateWithdrawal(uint256 batchId, address receiver, uint256 amount, string meta);

  ERC20 public constant USDT = ERC20(0x23261542222e0FB9b295a755f6127Ec4AEE4b0Bf); // USDT ON ZKEVM


  constructor() {}

  function deposit(string calldata _attestation, uint256 _amount) external {
    numberOfBatches += 1;
    USDT.transferFrom(msg.sender, address(this), _amount);
    PikaFractionalAttestationToken token = new PikaFractionalAttestationToken(this, numberOfBatches, _amount);
    batches[numberOfBatches] = Batch(numberOfBatches, token, _attestation, _amount, _amount);
    beneficiaryBalance[numberOfBatches][msg.sender] = _amount;
    emit Deposit(numberOfBatches, _attestation, _amount);
  }

  // TODO: this function should be a ZK-privacy-preserving mixer transaction
  function transferBeneficialOwnership(uint256 _batchId, address _to, uint256 _amount) external {
    require(beneficiaryBalance[_batchId][msg.sender] >= _amount, "Insufficient balance");
    beneficiaryBalance[_batchId][msg.sender] -= _amount;
    beneficiaryBalance[_batchId][_to] += _amount;
  }

  function withdrawWithAttestation(uint256 _batchId, uint256 _amount, string calldata _meta) external {
    require(beneficiaryBalance[_batchId][msg.sender] >= _amount, "Insufficient balance");
    beneficiaryBalance[_batchId][msg.sender] -= _amount;
    batches[_batchId].unwithdrawnAmount -= _amount;
    USDT.transfer(msg.sender, _amount);
    batches[_batchId].PikaFractionalAttestationToken.transfer(msg.sender, _amount);
    emit AttestedWithdrawal(_batchId, msg.sender, _amount, batches[_batchId].attestation, _meta);
  }

  function withdrawPrivately(uint256 _batchId, uint256 _amount, string calldata _meta) external {
    require(beneficiaryBalance[_batchId][msg.sender] >= _amount, "Insufficient balance");
    beneficiaryBalance[_batchId][msg.sender] -= _amount;
    batches[_batchId].unwithdrawnAmount -= _amount;
    USDT.transfer(msg.sender, _amount);
    emit PrivateWithdrawal(_batchId, msg.sender, _amount, _meta);
  }

}
