import { ethers } from "hardhat";

const REGISTRY = "0x21099aEcF8c318D1446431227E8D2b29b2086195";
const WETH     = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const WBTC     = "0x469F25921dfa340B6e426A92E1b449A519a2B538";
const WSOL     = "0x3d1F69b33C97f8e1E7fA12Bc5134e2BB9DC74D56";
const WTRX     = "0x18BBc0fB6C95C7bCa9008Fb72f973F72B95BAF3F";

const tokens = [
  { addr: WBTC, title: "Wrapped Bitcoin", symbol: "WBTC", desc: "Test BTC token for StudLending", category: "Lending" },
  { addr: WSOL, title: "Wrapped Solana",  symbol: "WSOL", desc: "Test SOL token for StudLending", category: "Lending" },
  { addr: WTRX, title: "Wrapped Tron",    symbol: "WTRX", desc: "Test TRX token for StudLending", category: "Lending" },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("StudentTokenRegistry", REGISTRY);

  for (const t of tokens) {
    try {
      const isReg = await registry.isRegistered(t.addr);
      if (isReg) {
        console.log(`${t.symbol}: already registered`);
        continue;
      }
      const tx = await registry.registerToken(
        t.addr, t.title, t.symbol, t.desc, t.category, "",
        WETH, false,
        "0x0000000000000000000000000000000000000000",
        BigInt(0),
        { gasLimit: 500000 }
      );
      await tx.wait();
      console.log(`${t.symbol}: registered`);
    } catch(e: any) {
      console.log(`${t.symbol}: error - ${e.message.slice(0, 80)}`);
    }
  }
}

main().catch(console.error);
