require('isomorphic-fetch')
require('isomorphic-form-data')
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
const wUtils    = web3.utils
const toWei     = wUtils.toWei
const hexToUtf8 = wUtils.hexToUtf8
const utf8ToHex = wUtils.utf8ToHex

const broadcastTransaction = async (rawTx) => {
  const broadcastUrl = "https://kovan.etherscan.io/api"
  const data = new FormData()
  data.append('module', 'proxy')
  data.append('action', 'eth_sendRawTransaction')
  data.append('hex', rawTx)
  let resp = await fetch(broadcastUrl, {
    method: "post",
    body: data,
  })
  resp = await resp.json()
  return resp
}

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

  try {
    const ctrAddress = web3.utils.toChecksumAddress(contractAddress.toString().trim())

    const contractClass = new web3.eth.Contract(abi, ctrAddress)
    const contractInstance = contractClass.methods

    // call getter
    const getter    = contractInstance.data()
    const getterRes = await getter.call()
    console.log("Getter: ", hexToUtf8(getterRes))

    // setter
    const rand = Math.round(Math.random()*999)
    const value = utf8ToHex(`foo-${rand}`)
    const setterCall  = contractInstance.set(value)
    const setterAbi   = setterCall.encodeABI()
    let setterGas = await contractInstance.data().estimateGas()
    setterGas = Math.max(265056, setterGas)
    console.log("gas:", setterGas)

    const setterData = {
      chainId: "0x2A", // Kovan chain (id: 42)
      from: address,
      data: setterAbi,
      gas:  setterGas,
      gasPrice: toWei("6", "gwei"),
      to: ctrAddress,
      // nonce: 1,
    }

    const tx = await account.signTransaction(setterData)
    const txRaw = tx.rawTransaction
    console.log("Raw TX:", txRaw)

    const response = await broadcastTransaction(txRaw)
    console.log("PUSH TX:", response)

  } catch (err) {
    console.error("Error", err)
  }

})()
