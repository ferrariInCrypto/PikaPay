pragma circom 2.0.0;

template TransferCircuit() {

    //  private inputs
    signal private input sender_balance;      // Sender's initial balance
    signal private input transfer_amount;     // Amount to be transferred
    signal private input new_commitment;      // New commitment for the balance after transfer
    signal private input nullifier;           // Nullifier to prevent double-spending

    //  public inputs
    signal input pub_new_commitment;        
    signal input pub_nullifier;               
    signal input pub_transfer_amount;         

    // Checks
    
    component is_transfer_amount_valid = IsLessThan();  // Checking if transfer amount <= balance

    is_transfer_amount_valid.in[0] <== transfer_amount;
    is_transfer_amount_valid.in[1] <== sender_balance;

    is_transfer_amount_valid.out.assertEquals(1);


    signal sender_new_balance;
    sender_new_balance <== sender_balance - transfer_amount;


    signal computed_new_commitment;
    computed_new_commitment <== hash([sender_new_balance, nullifier]);

    computed_new_commitment.assertEquals(pub_new_commitment);

    nullifier.assertEquals(pub_nullifier);
    
    // Output signals for verification
    signal output verified;
    verified <== 1;  
}

component main = TransferCircuit();
