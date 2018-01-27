const Web3 = require('web3')
const fs = require('fs')
const web3 = new Web3('https://kovan.infura.io')
const eth = web3.eth
const writeFileSync = fs.writeFileSync
const existsSync    = fs.existsSync
const file = ".private-key.txt"

const account = eth.accounts.create()
const privateKey = account.privateKey

if (existsSync(file)) {
  console.log(`Errpr: Private key file already present, please delete ${file} and re-run this script, aborting...`)
  process.exit()
}

writeFileSync(file, privateKey)

console.log(`New private key created and saved in .private-key.txt - corresponding ethereum account: ${account.address}`)
