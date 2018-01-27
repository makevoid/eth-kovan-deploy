const Web3 = require('web3')
const fs = require('fs')
const web3 = new Web3('https://kovan.infura.io')
const eth = web3.eth
const readFileSync  = fs.readFileSync
const writeFileSync = fs.writeFileSync
const existsSync    = fs.existsSync
const keyFile = ".private-key.txt"
const contractAddressFile = "contract-address.txt"
const privateKey = readFileSync(keyFile)
const account = eth.accounts.privateKeyToAccount(privateKey)
const address = account.address
const abi = require("./contract.abi.json")

if (!existsSync(contractAddressFile)) {
  console.error("Error: contract address not present, deploy your contract first! exiting...")
  process.exit()
}

const contractAddress = readFileSync(contractAddressFile)

; // leave this before async
(async () => {

  // connection check:
  const blockNumber = await eth.getBlockNumber()
  console.log(`Kovan block number: ${blockNumber}`)
  if (!blockNumber) {
    console.log("Got wrong response from Kovan Infura, please check your Infura token.")
    process.exit()
  }

  const deployOptions = {
    chainId: "0x2A", // Kovan chain (id: 42)
    from: address,
    // nonce: 1,
  }

  try {

    const contractClass = new web3.eth.Contract(abi, contractAddress)
    const contractInstance = contractClass.methods

    const data = contractInstance.data()
    console.log("resp", data.toString())
  } catch (err) {
    console.error("Error", err)
  }

})()
