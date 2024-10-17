// SPDX-License-Identifier: UNLICENSED
// Written by: trevor@tk.co

pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PikaFractionalAttestationToken is ERC20 {
    PikaPay public pikaPay;
    uint256 public batchId;

    // Constructor to initialize the Fractional Attestation Token with a unique batch ID
    constructor(
        PikaPay _pikaPay,
        uint256 _batchId,
        uint256 _initialSupply
    )
        ERC20(
            string.concat(
                "PikaPay Fractional Batch #",
                Strings.toString(_batchId)
            ),
            "PFAT" // Token symbol PFAT = Pika Fractional Attestation Token
        )
    {
        pikaPay = _pikaPay;
        batchId = _batchId;
        _mint(msg.sender, _initialSupply); // Minting the initial token supply to the deployer
    }

    // Hook function to ensure only PikaPay can transfer this token type
    function _beforeTokenTransfer(address from) internal view {
        require(
            from == address(pikaPay),
            "Only PikaPay contract can initiate transfers."
        );
    }
}

contract PikaPay {
    // Struct to represent each Batch with its associated token and metadata
    struct Batch {
        uint256 batchId; // Unique batch identifier
        PikaFractionalAttestationToken token; // Token representing fractional ownership
        string attestationDetails; // Descriptive metadata or attestation
        uint256 totalSupply; // Total token supply in this batch
        uint256 remainingSupply; // Remaining supply available for withdrawal
        bool isFinalized; // Tracks if the batch is finalized
    }

    uint256 public totalBatches = 0; // Total number of batches created
    mapping(uint256 => Batch) public batchRegistry; // Mapping to store batch information by ID
    mapping(uint256 => mapping(address => uint256)) public beneficiaryBalances; // Tracks each user's balance in a specific batch

    // Events for logging deposit, withdrawal, and batch updates
    event BatchCreated(
        uint256 batchId,
        string attestationDetails,
        uint256 totalAmount
    );
    event AttestedWithdrawal(
        uint256 batchId,
        address beneficiary,
        uint256 amount,
        string attestation,
        string metadata
    );
    event PrivateWithdrawal(
        uint256 batchId,
        address beneficiary,
        uint256 amount,
        string metadata
    );
    event BatchFinalized(uint256 batchId);
    event BatchUpdated(uint256 batchId, string updatedAttestationDetails);

    ERC20 public constant USDT =
        ERC20(0x48db5c1155836dE945fB82b6A9CF82D91AC21f16); // Constant USDT token address 

    constructor() {}

    // Function to create a new batch with a custom attestation and deposit an initial supply of tokens
    function createNewBatchWithAttestation(
        string calldata _attestationDetails,
        uint256 _depositAmount
    ) external {
        totalBatches += 1;
        USDT.transferFrom(msg.sender, address(this), _depositAmount);

        // Deploy a new instance of PikaFractionalAttestationToken for the batch
        PikaFractionalAttestationToken token = new PikaFractionalAttestationToken(
                this,
                totalBatches,
                _depositAmount
            );
        batchRegistry[totalBatches] = Batch(
            totalBatches,
            token,
            _attestationDetails,
            _depositAmount,
            _depositAmount,
            false
        );

        beneficiaryBalances[totalBatches][msg.sender] = _depositAmount; // Set the depositor as the initial owner
        emit BatchCreated(totalBatches, _attestationDetails, _depositAmount);
    }

    // Function to transfer the ownership of a portion of tokens to another beneficiary
    function transferBatchOwnership(
        uint256 _batchId,
        address _newOwner,
        uint256 _transferAmount
    ) external {
        require(
            beneficiaryBalances[_batchId][msg.sender] >= _transferAmount,
            "Insufficient balance for transfer."
        );
        beneficiaryBalances[_batchId][msg.sender] -= _transferAmount;
        beneficiaryBalances[_batchId][_newOwner] += _transferAmount;
    }

    // Withdraw tokens with attestation, emitting metadata for transparency
    function withdrawWithAttestationProof(
        uint256 _batchId,
        uint256 _withdrawAmount,
        string calldata _metadata
    ) external {
        require(
            !batchRegistry[_batchId].isFinalized,
            "Batch has already been finalized."
        );
        require(
            beneficiaryBalances[_batchId][msg.sender] >= _withdrawAmount,
            "Insufficient balance for withdrawal."
        );

        // Update the balances and transfer tokens
        beneficiaryBalances[_batchId][msg.sender] -= _withdrawAmount;
        batchRegistry[_batchId].remainingSupply -= _withdrawAmount;

        USDT.transfer(msg.sender, _withdrawAmount);
        batchRegistry[_batchId].token.transfer(msg.sender, _withdrawAmount);

        emit AttestedWithdrawal(
            _batchId,
            msg.sender,
            _withdrawAmount,
            batchRegistry[_batchId].attestationDetails,
            _metadata
        );

        // Finalize the batch if all tokens have been withdrawn
        if (batchRegistry[_batchId].remainingSupply == 0) {
            finalizeBatch(_batchId);
        }
    }

    // Withdraw tokens privately without attestation, providing optional metadata
    function withdrawWithoutAttestation(
        uint256 _batchId,
        uint256 _withdrawAmount,
        string calldata _metadata
    ) external {
        //This function is under development
    }

    // Finalize a batch when all tokens have been withdrawn to prevent further actions
    function finalizeBatch(uint256 _batchId) internal {
        require(
            !batchRegistry[_batchId].isFinalized,
            "Batch is already finalized."
        );
        require(
            batchRegistry[_batchId].remainingSupply == 0,
            "There are still unwithdrawn tokens."
        );

        batchRegistry[_batchId].isFinalized = true;
        emit BatchFinalized(_batchId);
    }

    // Update attestation details of an existing batch before it is finalized
    function modifyBatchAttestation(
        uint256 _batchId,
        string calldata _newAttestationDetails
    ) external {
        require(
            !batchRegistry[_batchId].isFinalized,
            "Cannot modify attestation for a finalized batch."
        );
        batchRegistry[_batchId].attestationDetails = _newAttestationDetails;
        emit BatchUpdated(_batchId, _newAttestationDetails);
    }

    // Partial withdrawal to allow the user to withdraw in increments
    function withdrawPartialAmount(
        uint256 _batchId,
        uint256 _partialAmount,
        string calldata _metadata
    ) external {
        require(
            !batchRegistry[_batchId].isFinalized,
            "Batch has been finalized."
        );
        require(
            beneficiaryBalances[_batchId][msg.sender] >= _partialAmount,
            "Insufficient balance for partial withdrawal."
        );

        // Update balances and transfer the partial amount
        beneficiaryBalances[_batchId][msg.sender] -= _partialAmount;
        batchRegistry[_batchId].remainingSupply -= _partialAmount;

        USDT.transfer(msg.sender, _partialAmount);
        emit PrivateWithdrawal(_batchId, msg.sender, _partialAmount, _metadata);

        // Finalize the batch if the remaining supply becomes zero
        if (batchRegistry[_batchId].remainingSupply == 0) {
            finalizeBatch(_batchId);
        }
    }

    // View function to retrieve the balance of a specific beneficiary within a batch
    function getBeneficiaryBalance(
        uint256 _batchId,
        address _beneficiary
    ) external view returns (uint256) {
        return beneficiaryBalances[_batchId][_beneficiary];
    }
}
