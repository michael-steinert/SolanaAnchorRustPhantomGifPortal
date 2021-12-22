# Solana
* Reading Data on Accounts on Solana is free
* Creating Accounts and Adding Data to Accounts costs SOL

* Solana Programs are upgradeable and stateless
* When a Solana Program is re-deployed:
  * the Program ID is updated to point to the latest Version of the Program
  * the Accounts that the Program integrates with will stick around - these Accounts keep Data related to the Program
* So Programs can be upgraded while keeping the Data separate

* The IDL (Interface Description Language) has Information about the Solana Program like the Names of Functions and the Parameters they accept
* The IDL provides to an Application how to interact with a deployed Solana Program with the help of the Program ID

# Getting started
| Command                                                               | Description                                   |
|-----------------------------------------------------------------------|-----------------------------------------------|
| solana-keygen new                                                     | Creates a local Keypair                       |
| solana address                                                        | Shows Public Address of local Wallet          |
| anchor test                                                           | Tests Solana Program (and builds it)          |
| solana config set --url devnet                                        | Switch to Solana Devnet                       |
| solana config get                                                     | Show Solana Configuration                     |
| solana airdrop 2                                                      | Airdrop some SOL (2 SOL is Maximum on Devnet) |
| anchor build                                                          | Build the Program                             |
| solana address -k target/deploy/solana_anchor_gif_portal-keypair.json | Create new Build with a Program ID            |




