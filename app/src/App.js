import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import {useEffect, useState} from "react";
import {Connection, PublicKey, clusterApiUrl} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
import idl from "./idl/idl.json";
import keyPair from "./assets/keypair.json";

/* SystemProgram is a Reference Core Program (Runtime) that runs Solana */
const {SystemProgram, Keypair} = web3;

/* Create every time a Keypair for the Account that will hold the GIF Data */
// let baseAccount = Keypair.generate();

/* Load created (permanent) Keypair for the Account that will hold the GIF Data */
const keyPairArray = Object.values(keyPair._keypair.secretKey);
const secret = new Uint8Array(keyPairArray);
const baseAccount = web3.Keypair.fromSecretKey(secret);

/* Get Program's ID from the IDL File */
const programID = new PublicKey(idl.metadata.address);

/* Set Network to Devnet */
const network = clusterApiUrl("devnet");

/* Controls how we want to acknowledge when a transaction is "done" */
/* The `preflightCommitment` allows choosing when to receive a Confirmation that the Transaction has succeeded */
/* `processed` sends a Confirmation when the Transaction is confirmed by the actual connected Node */
const opts = {
    preflightCommitment: "processed"
}

const App = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [gifList, setGifList] = useState([]);

    /* Checking due first Mount if Phantom Wallet is connected */
    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener("load", onLoad);
        return (() => {
            return window.removeEventListener("load", onLoad);
        });
    }, []);

    useEffect(() => {
        if (walletAddress) {
            console.log("Fetching GIF List");
            getGifList().catch(console.error);
        }
    }, [walletAddress]);

    /* Phantom Wallet extension inject Object `solana` into Object `window` */
    /* Connecting the Wallet to Website, the Website will have the Permission to run Functions from Blockchain Program */
    const checkIfWalletIsConnected = async () => {
        try {
            const {solana} = window;
            if (solana) {
                if (solana.isPhantom) {
                    console.log("Phantom Wallet found");
                    /* Checking if Application is authorized by User if so, then directly connecting with User's Wallet */
                    const response = await solana.connect({
                        onlyIfTrusted: true
                    });
                    console.log("Connected with Public Key:", response.publicKey.toString());
                    /* Setting User's Public Key in State */
                    setWalletAddress(response.publicKey.toString());
                }
            } else {
                alert("Solana Object not found - Get a Phantom Wallet");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const connectWallet = async () => {
        const {solana} = window;
        if (solana) {
            const response = await solana.connect();
            console.log("Connected with Public Key:", response.publicKey.toString());
            setWalletAddress(response.publicKey.toString());
        }
    };

    const onInputChange = (event) => {
        const {value} = event.target;
        setInputValue(value);
    };

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        /* A Provider is an authenticated Connection to Solana */
        /* The Object `window.solana` is injected by the Phantom Wallet */
        const provider = new Provider(connection, window.solana, opts.preflightCommitment);
        return provider;
    }

    /* Creating / Initializing Solana Program's BaseAccount */
    const createGifAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            await program.rpc.startStuffOff({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey.toString(),
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("Created a new BaseAccount witch Address:", baseAccount.publicKey.toString());
            await getGifList();
        } catch (error) {
            console.log("Error creating BaseAccount Account:", error);
        }
    }

    const getGifList = async () => {
        try {
            const provider = getProvider();
            /* JavaScript Representation of Solana Program */
            const program = new Program(idl, programID, provider);
            /* Calling Solana Program */
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            console.log("Got the Account", account);
            /* Setting GIF List in State */
            setGifList(account.gifList);
        } catch (error) {
            console.log("Error in getGifList: ", error);
            setGifList(null);
        }
    }

    const sendGif = async () => {
        if (inputValue.length === 0) {
            console.log("No GIF Link given");
            return;
        }
        setInputValue("");
        console.log("GIF Link:", inputValue);
        try {
            const provider = getProvider();
            /* JavaScript Representation of Solana Program */
            const program = new Program(idl, programID, provider);
            await program.rpc.addGif(inputValue, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey.toString()
                }
            });
            console.log("GIF successfully sent to Program", inputValue);

            await getGifList();
        } catch (error) {
            console.log("Error during Sending GIF:", error);
        }
    }

    const renderNotConnectedContainer = () => (
        <button
            className={"cta-button connect-wallet-button"}
            onClick={connectWallet}
        >
            Connect to Phantom Wallet
        </button>
    );

    const renderConnectedContainer = () => {
        // User has connected their Wallet, but BaseAccount account has not been created / initialized
        if (gifList === null) {
            return (
                <div className="connected-container">
                    <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                        Do One-Time Initialization for GIF Program Account
                    </button>
                </div>
            )
        } else {
            // User has connected their Wallet, and BaseAccount exists
            return (
                <div className={"connected-container"}>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendGif().catch(console.error);
                        }}
                    >
                        <input
                            type={"text"}
                            placeholder={"Enter GIF Link"}
                            value={inputValue}
                            onChange={onInputChange}
                        />
                        <button type={"submit"} className={"cta-button submit-gif-button"}>
                            Submit
                        </button>
                    </form>
                    <div className={"gif-grid"}>
                        {
                            gifList.map((item, index) => {
                               return (
                                   <div className={"gif-item"} key={index}>
                                       <img src={item.gifLink} alt={"GIF not found"}/>
                                   </div>
                               );
                            })
                        }
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={"App"}>
            <div className={walletAddress ? "authed-container" : "container"}>
                <div className={"header-container"}>
                    <p className={"header"}>GIF Portal</p>
                    <p className={"sub-text"}>
                        View a GIF Collection in the Metaverse
                    </p>
                    {!walletAddress && renderNotConnectedContainer()}
                    {walletAddress && renderConnectedContainer()}
                </div>
                <div className={"footer-container"}>
                    <img alt={"Twitter Logo"} className={"twitter-logo"} src={twitterLogo}/>
                    <a
                        className={"footer-text"}
                        href={"/#"}
                        target={"_blank"}
                        rel={"noreferrer"}
                    >bla</a>
                </div>
            </div>
        </div>
    );
};

export default App;
