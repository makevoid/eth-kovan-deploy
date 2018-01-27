# deploy-kovan

### Setup

Run:

```
npm install
```

### Create account

Run:

```
node create-account.js
```


### Deploy contract

Run:

```
node .
```

### Test contract (setter + getter)

Run:

```
node call-contract.js
```


### Note

I used Remix to create the binary and abi of the contract, I just compiled with it and saved those in `contract.(abi|bin).json` files. This script should work with all contracts with small modifications but it's set up to work with `SimpleStorage.sol` by default, which should give you a smooth start.

Enjoy!

@makevoid
