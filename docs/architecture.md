# Architecture

This repo is organized as a monorepo for clarity.

## Structure
- `contracts/` Hardhat (Sepolia university AMM model)
- `apps/web/` Next.js frontend
- `docs/` supporting documentation (architecture/user-flow/contracts/deployment)

## Flow overview
1. Students register ERC-20 tokens via StudentTokenRegistry.
2. AllowedBaseTokens defines what base tokens can be used.
3. PairLauncher creates AMM pairs (WETH or already-registered tokens).
4. Liquidity is added to pairs; price is derived from reserves.
5. ReceiptVault locks LP tokens and mints ReceiptToken.
6. After 30 days, users redeem receipt for LP + bonus (if enabled and reserve available).
