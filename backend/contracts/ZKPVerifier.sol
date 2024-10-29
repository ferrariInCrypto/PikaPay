// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


//@Demo Verifier contract


import "@zkp/verifier.sol"; 

contract ZKPVerifier {
  
    address private trustedSetup;

    constructor(address _trustedSetup) {
        trustedSetup = _trustedSetup;
    }

    // Verify the proof
    function verifyProof(
        uint256[2] memory a, // Proof 'a' (two coordinates)
        uint256[2][2] memory b, // Proof 'b' (two pairs of coordinates)
        uint256[2] memory c, // Proof 'c' (two coordinates)
        uint256[1] memory input // Public input
    ) public view returns (bool) {

       
        return Verifier.verifyProof(a, b, c, input);
    }
}
