require('isomorphic-fetch')
require('isomorphic-form-data')
const fs = require('fs')
const Web3 = require('web3')
const web3 = new Web3('https://kovan.infura.io')
const eth = web3.eth
const readFileSync  = fs.readFileSync
const writeFileSync = fs.writeFileSync
const toWei = web3.utils.toWei
const keyFile = ".private-key.txt"
const contractAddressFile = "contract-address.txt"
const privateKey = readFileSync(keyFile)
const account = eth.accounts.privateKeyToAccount(privateKey)
const address = account.address

console.log(`Loading ETH account: ${address}`)

const abi = require("./contract.abi.json")
let   bin = require("./contract.bin.json")
bin = bin["object"]

const broadcastTransaction = async (rawTx) => {
  const broadcastUrl = "https://kovan.etherscan.io/api"
  const data = new FormData()
  data.append('module', 'proxy')
  data.append('action', 'eth_sendRawTransaction')
  data.append('hex', rawTx)
  data.append('apikey', '3DQFQQZ51G4M18SW8RDKHIMERD79GYTVEA') // please use your own api key
  let resp = await fetch(broadcastUrl, {
    method: "post",
    body: data,
  })
  resp = await resp.json()
  return resp
}

; // leave this before async
(async () => {

  // connection check:
  const blockNumber = await eth.getBlockNumber()
  console.log(`Kovan block number: ${blockNumber}`)
  if (!blockNumber) {
    console.log("Got wrong response from Kovan Infura, please check your Infura token.")
    process.exit()
  }

  // estimate contract deployment cost
  const gasCost = await eth.estimateGas({ data: `0x${bin}` })
  console.log("gasCost:", gasCost)

  const deployOptions = {
    chainId: "0x2A", // Kovan chain (id: 42)
    from: address,
    gas:  gasCost,
    data: `0x${bin}`,
    gasPrice: toWei("6", "gwei"),
    // nonce: 1,
  }

  console.log("Deploying contract...")

  const tx = await account.signTransaction(deployOptions)
  const txRaw = tx.rawTransaction
  console.log("Raw TX:", txRaw)
  console.log("You can also push manually via https://kovan.etherscan.io/pushtx")

  const response = await broadcastTransaction(txRaw)
  console.log("PUSH TX:", response)

  if (response && response.result) {
    writeFileSync(contractAddressFile, response.result)
  }
})()
