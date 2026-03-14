# Deployment

## Environments
- Sepolia testnet only (chainId 11155111).

## Required env variables
See `.env.example`:
- `SEPOLIA_RPC_URL` (e.g. Infura/Alchemy)
- `SEPOLIA_PRIVATE_KEY` (never commit)
- `DEPLOYER_ADDRESS` (your public address)
- university AMM addresses (`UNIVERSITY_FACTORY_ADDRESS`, `UNIVERSITY_ROUTER_ADDRESS`, `WETH_ADDRESS`)

## Steps (Hardhat)
1. `cd contracts`
2. `npm install`
3. `npx hardhat test`
4. `npx hardhat run scripts/deploy.ts --network sepolia`

Deployment writes contract addresses to `contracts/deployments/sepolia.json` for the frontend.

## Verification
- optional: `npx hardhat verify <contractAddress> --network sepolia ...`
