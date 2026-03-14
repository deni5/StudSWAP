# Contracts

## Core modules
- **StudentTokenRegistry.sol**: store metadata, registration, bonus mode parameters (lock period 30 days).
- **AllowedBaseTokens.sol**: allowlist base tokens (WETH + registered student tokens) for creating pairs.
- **PairLauncher.sol**: create/find pair in the university DEX factory.
- **ReceiptToken.sol**: ERC721 receipt for locked LP positions.
- **ReceiptVault.sol**: lock LP token, mint receipt, redeem after unlock and route bonus payout.
- **BonusReserveManager.sol**: accept bonus reserve deposits and pay bonus (capped to remaining reserve).

## Assumptions
- LP tokens are standard share tokens emitted by the university AMM (V2-like).
- Price comes from reserves in the pair contracts.
- Bonus payouts are limited by reserve; if insufficient, payout is capped.
