const fs = require("fs");
const anchor = require("@project-serum/anchor");

const account = anchor.web3.Keypair.generate();
//  Writing a Key Pair to File System
fs.writeFileSync("../assets/keypair.json", JSON.stringify(account));