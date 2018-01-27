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
const toWei = web3.utils.toWei

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
    const ctrAddress = web3.utils.toChecksumAddress(contractAddress.toString())
    console.log(ctrAddress)
    const ctrOptions = {
      gasPrice: toWei("6", "gwei"),
      chainId: "0x2A", // Kovan chain (id: 42)
    }
    const contractClass = new web3.eth.Contract(abi, ctrAddress, ctrOptions)
    contractClass.options.address = ctrAddress
    const contractInstance = contractClass.methods

    const getter    = contractInstance.data()
    const getterRes = await getter.call()

    console.log("Getter: ", getterRes)
    // --------


    // getter
    const rand = Math.round(Math.random()*999)
    const setterCall  = contractInstance.set.send(`foo-${rand}`)
    const setterAbi   = setterCall.encodeABI()
    let getterGas = await contractInstance.data().estimateGas()
    console.log("gas", getterGas)
    //
    // const getterData = {
    //   chainId: "0x2A", // Kovan chain (id: 42)
    //   from: address,
    //   data: getterAbi,
    //   gas:  getterGas,
    //   gasPrice: toWei("6", "gwei"),
    //   // nonce: 1,
    // }
    //
    // const tx = await account.signTransaction(getterData)
    // const txRaw = tx.rawTransaction
    // console.log("Raw TX:", txRaw)

  } catch (err) {
    console.error("Error", err)
  }

})()
