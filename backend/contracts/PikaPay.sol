// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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
        require(_initialSupply > 0, "Initial supply must be greater than 0");
        pikaPay = _pikaPay;
        batchId = _batchId;
        _mint(msg.sender, _initialSupply);
    }

    // Hook function to ensure only PikaPay can transfer this token type
    // Hook function to ensure only PikaPay can transfer this token type

    function _beforeTokenTransfer(address from) internal view {
        require(
            from == address(pikaPay),
            "Only PikaPay contract can initiate transfers."
        );
    }
}

contract PikaPay  {
    using SafeERC20 for ERC20;

    // Struct to represent each Batch with its associated token and metadata

    struct Batch {
        uint256 batchId; // Unique batch identifier
        PikaFractionalAttestationToken token; // Token representing fractional ownership
        string attestationDetails; // Descriptive metadata or attestation
        uint256 totalSupply; // Total token supply in this batch
        uint256 remainingSupply; // Remaining supply available for withdrawal
        bool isFinalized; // Tracks if the batch is finalized
        address owner; // Owner of the batch
    }

    uint256 public totalBatches = 0; // Total number of batches created
    mapping(uint256 => Batch) public batchRegistry; // Mapping to store batch information by ID
    mapping(uint256 => mapping(address => uint256)) public beneficiaryBalances; // Tracks each user's balance in a specific batch

    // Events for logging deposit, withdrawal, and batch updates
    event BatchCreated(
        uint256 batchId,
        address indexed owner,
        string attestationDetails,
        uint256 totalAmount
    );
    event AttestedWithdrawal(
        uint256 batchId,
        address indexed beneficiary,
        uint256 amount,
        string attestation,
        string metadata
    );
    event PrivateWithdrawal(
        uint256 batchId,
        address indexed beneficiary,
        uint256 amount,
        string metadata
    );
    event BatchFinalized(uint256 batchId);
    event BatchUpdated(uint256 batchId, string updatedAttestationDetails);
    event OwnershipTransferred(
        uint256 batchId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 amount
    );

    ERC20 public constant USDT =
        ERC20(0x48db5c1155836dE945fB82b6A9CF82D91AC21f16); // Constant USDT token address

    // Modifier to restrict actions to batch owners
    modifier onlyBatchOwner(uint256 _batchId) {
        require(
            batchRegistry[_batchId].owner == msg.sender,
            "Caller is not the batch owner"
        );
        _;
    }

    // Modifier to validate batch existence
    modifier validBatchId(uint256 _batchId) {
        require(_batchId > 0 && _batchId <= totalBatches, "Invalid batch ID");
        _;
    }

    // Function to create a new batch with a custom attestation and deposit an initial supply of tokens
    function createNewBatchWithAttestation(
        string calldata _attestationDetails,
        uint256 _depositAmount
    ) external  {
        // require(
        //     bytes(_attestationDetails).length > 0,
        //     "Attestation details required"
        // );
        require(_depositAmount > 0, "Deposit amount must be greater than 0");

        totalBatches += 1;
        USDT.safeTransferFrom(msg.sender, address(this), _depositAmount);

        // Deploy a new instance of PikaFractionalAttestationToken for the batch
        PikaFractionalAttestationToken token = new PikaFractionalAttestationToken(
                this,
                totalBatches,
                _depositAmount
            );

        batchRegistry[totalBatches] = Batch({
            batchId: totalBatches,
            token: token,
            attestationDetails: _attestationDetails,
            totalSupply: _depositAmount,
            remainingSupply: _depositAmount,
            isFinalized: false,
            owner: msg.sender
        });

        beneficiaryBalances[totalBatches][msg.sender] = _depositAmount; // Set the depositor as the initial owner
        emit BatchCreated(
            totalBatches,
            msg.sender,
            _attestationDetails,
            _depositAmount
        );
    }

    // Function to transfer the ownership of a portion of tokens to another beneficiary
    function transferBatchOwnership(
        uint256 _batchId,
        address _newOwner,
        uint256 _transferAmount
    ) external  validBatchId(_batchId) onlyBatchOwner(_batchId) {
        require(_newOwner != address(0), "Invalid new owner address");
        require(
            beneficiaryBalances[_batchId][msg.sender] >= _transferAmount,
            "Insufficient balance for transfer."
        );

        beneficiaryBalances[_batchId][msg.sender] -= _transferAmount;
        beneficiaryBalances[_batchId][_newOwner] += _transferAmount;

        emit OwnershipTransferred(
            _batchId,
            msg.sender,
            _newOwner,
            _transferAmount
        );
    }

    // Withdraw tokens with attestation, emitting metadata for transparency
    function withdrawWithAttestationProof(
        uint256 _batchId,
        uint256 _withdrawAmount,
        string calldata _metadata
    ) external  validBatchId(_batchId) {
        Batch storage batch = batchRegistry[_batchId];
        require(!batch.isFinalized, "Batch has already been finalized.");
        require(
            beneficiaryBalances[_batchId][msg.sender] >= _withdrawAmount,
            "Insufficient balance for withdrawal."
        );

        // Update the balances and transfer tokens
        beneficiaryBalances[_batchId][msg.sender] -= _withdrawAmount;
        batch.remainingSupply -= _withdrawAmount;

        USDT.safeTransfer(msg.sender, _withdrawAmount);
        batch.token.transfer(msg.sender, _withdrawAmount);

        emit AttestedWithdrawal(
            _batchId,
            msg.sender,
            _withdrawAmount,
            batch.attestationDetails,
            _metadata
        );

        // Finalize the batch if all tokens have been withdrawn
        if (batch.remainingSupply == 0) {
            finalizeBatch(_batchId);
        }
    }

    // Withdraw tokens privately without attestation, providing optional metadata
    
    function withdrawWithoutAttestation(
        uint256 _batchId,
        uint256 _withdrawAmount,
        string calldata _metadata
    ) external  validBatchId(_batchId) {

        // The function will alllow the user t withdraw without attestation. The following code is under develepment


    }

    // Finalize a batch when all tokens have been withdrawn to prevent further actions
    function finalizeBatch(uint256 _batchId) internal {
        Batch storage batch = batchRegistry[_batchId];
        require(!batch.isFinalized, "Batch is already finalized.");
        require(
            batch.remainingSupply == 0,
            "There are still unwithdrawn tokens."
        );

        batch.isFinalized = true;
        emit BatchFinalized(_batchId);
    }

    // Update attestation details of an existing batch before it is finalized
    function modifyBatchAttestation(
        uint256 _batchId,
        string calldata _newAttestationDetails
    ) external validBatchId(_batchId) onlyBatchOwner(_batchId) {
        Batch storage batch = batchRegistry[_batchId];
        require(
            !batch.isFinalized,
            "Cannot update attestation for a finalized batch."
        );

        batch.attestationDetails = _newAttestationDetails;
        emit BatchUpdated(_batchId, _newAttestationDetails);
    }
}
