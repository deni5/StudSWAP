const { createPublicClient, http, formatUnits, getAddress } = require('viem');
const { sepolia } = require('viem/chains');
const client = createPublicClient({ chain: sepolia, transport: http() });
const OCT26 = getAddress("0xb5b34ace146f68041ddc80fb960c8d200b3258f1");
async function main() {
  const decimals = await client.readContract({
    address: OCT26,
    abi: [{ name:'decimals', type:'function', inputs:[], outputs:[{type:'uint8'}], stateMutability:'view' }],
    functionName: 'decimals'
  });
  const totalSupply = await client.readContract({
    address: OCT26,
    abi: [{ name:'totalSupply', type:'function', inputs:[], outputs:[{type:'uint256'}], stateMutability:'view' }],
    functionName: 'totalSupply'
  });
  console.log("OCT26 decimals:", decimals);
  console.log("Total supply (raw):", totalSupply.toString());
  console.log("Total supply (formatted):", formatUnits(totalSupply, Number(decimals)));

  // Перевіримо резерви з правильними decimals
  const PAIR = getAddress("0x32C803Ea53A882c8D708211866412D5EC48290A8");
  const [r0, r1] = await client.readContract({
    address: PAIR,
    abi: [{ name:'getReserves', type:'function', inputs:[], outputs:[{type:'uint112'},{type:'uint112'},{type:'uint32'}], stateMutability:'view' }],
    functionName: 'getReserves'
  });
  const token0 = await client.readContract({
    address: PAIR,
    abi: [{ name:'token0', type:'function', inputs:[], outputs:[{type:'address'}], stateMutability:'view' }],
    functionName: 'token0'
  });
  const isOCT26 = token0.toLowerCase() === OCT26.toLowerCase();
  const rOCT26raw = isOCT26 ? r0 : r1;
  const rWETH     = isOCT26 ? r1 : r0;
  console.log("\nReserve OCT26 (raw):", rOCT26raw.toString());
  console.log("Reserve OCT26 (formatted with actual decimals):", formatUnits(rOCT26raw, Number(decimals)));
  console.log("Reserve WETH:", formatUnits(rWETH, 18));
  console.log("Rate: 1 ETH =", (Number(formatUnits(rOCT26raw, Number(decimals))) / Number(formatUnits(rWETH, 18))).toFixed(4), "OCT26");
}
main().catch(console.error);
