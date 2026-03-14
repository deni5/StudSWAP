# StudSWAP — Project brief

MVP DEX-платформа для студентських кастомних ERC-20 токенів у мережі Sepolia (локальна університетська модель AMM).

## MVP scope
- Registry: реєстрація токенів + metadata + bonus режим
- Pair launcher: створення пар (WETH або інші зареєстровані токени)
- Liquidity: додавання первинної ліквідності, резервації, ціна з pool reserves
- Market list: пари, ціна, ліквідність, кнопки Swap/Add LP
- Swap: quote, slippage
- Vault: депозит LP -> receipt token -> redeem після 30 днів
- Bonus reserve: опціональний бонус із лімітованого резерву

## Architecture (цільова структура)
- `contracts/` Hardhat: AllowedBaseTokens, StudentTokenRegistry, PairLauncher, ReceiptToken, ReceiptVault, BonusReserveManager
- `apps/web/` Next.js + TS + Tailwind + wagmi + RainbowKit
- `docs/`: architecture/user-flow/contracts/deployment

## Next steps
1) docs створені
2) Hardhat skeleton
3) Next.js skeleton
