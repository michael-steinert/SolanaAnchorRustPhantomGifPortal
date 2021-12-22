const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

const main = async () => {
    console.log("Starting Test")
    // Configure the Provider to use the local Cluster from `solana config`
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);

    // Create every Time an Account Keypair for the Program to use
    const baseAccount = anchor.web3.Keypair.generate();

    // Compile Code in lib.rs and get it deployed locally on a local Validator
    const program = anchor.workspace.SolanaAnchorGifPortal;

    // Call Function from lib.rs  - `await` will wait until the Validator has confirmed the Transaction
    const transaction = await program.rpc.startStuffOff({
        // Parameters are specified in the Struct `pub struct StartStuffOff`
        accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
    });
    console.log("Transaction Signature", transaction);

    // Fetch Data from the Account
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log("GIF Count", account.totalGifs.toString());

    // Calling Function `add_gif`
    await program.rpc.addGif("gif_link_example", {
        accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
        }
    });

    // Fetch Data from the Account
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log("GIF Count", account.totalGifs.toString());
    console.log("GIF List", account.gifList);
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain().catch(console.error);
