# User flow

1. **Connect wallet** (Sepolia only).
2. **Register token**: token address, title, metadata, optional bonus enabled.
3. **Create pool**: pick base token (WETH or another registered token) and launch pair.
4. **Add liquidity**: deposit two assets -> receive LP token.
5. **Market**: pairs list shows reserves, liquidity, price derived from pool reserves.
6. **Swap**: swap within available pairs with slippage control and tx status.
7. **Vault**: deposit LP token -> mint receipt token.
8. **Redeem**: after 30 days redeem receipt -> get LP back + bonus (if enabled and reserve sufficient).


**Important guardrails**
- Only registered tokens in selects.
- Base tokens allowed list controlled by `AllowedBaseTokens`.
- Redeem disabled before unlock timestamp.
