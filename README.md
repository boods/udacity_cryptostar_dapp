# Udacity CrytoStar DAPP

## Build Requirements
To build locally requires the following: 
- Truffle v5.3.0 
- OpenZeppelin v4.0.0

## Code
- The StarNotary smart contract is located in `contracts\StarNotary`.
- By default, the contract will be deployed with: 
  - Name: `StellaSaccus` (Star Wallet in latin)
  - Symbol: `STS`
  - These properties can be changed by adjusting the migration script `migrations\2_deploy_contracts.js`

## Rinkeby Deployment
Deployed contract details on the Rinkeby network: 
- Contract address: 0xdCc8706Eb863AA411144f9F9378d99235ca6d017
- Deployment Transaction: 0x8b9d8310d5319b1b724198801fcc6b6310f5ffebfd499577576f3a66c8d3e112
- Deployment Account: 0xcabc744D0716AC4E65c16C78c45939708d7078d8

## Building the SmartContract
- Adjust the 'networks - develop' section of truffle-config.js to suite your dev environment (the default is set to hostname 0.0.0.0 on port 8545, to support building on wsl2 running on Windows 10)
- Launch the local ethereum test network by running `truffle develop` in the base directory
- To build, execute `compile`
- To deploy, execute `migrate --reset`
- To test, execute `test` 

## Building the web application 
- Change to the `app` directory
- Run `npm install`
- Run `npm run dev`
- Browse to `http://localhost:8080`, log in to Metamask, and connect to the local ethereum block chain

## Deploying to Rinkeby (or other test network) using Infura 
- Install the hardware wallet provider: `npm install @truffle/hdwallet-provider`
- Configure the network in truffle-config.js, including an infura project id and mnemonic (held in .secrets and not included in the repo)
- Launch the console, connected to the test network: `npx truffle console --network rinkeby`
- Check that you have an account with funding: 
  - List accounts: `await web3.eth.getAccounts()`
  - Check balance: `await web3.eth.getBalance('0x000MYACCOUNTID000')`
- Deploy: `migrate`

