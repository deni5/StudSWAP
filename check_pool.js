const { createPublicClient, http, formatUnits } = require('viem');
const { sepolia } = require('viem/chains');

const client = createPublicClient({ chain: sepolia, transport: http() });

const FACTORY = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";
const WETH    = "0x7b79995e5f793A07Bc00c21d5351294FAD53Bc43";
const OCT26   = "0xb5b34ace146f68041ddC80fb960c8d200b3258F1";

async function main() {
  const pair = await client.readContract({
    address: FACTORY,
    abi: [{ name:'getPair', type:'function', inputs:[{type:'address'},{type:'address'}], outputs:[{type:'address'}], stateMutability:'view' }],
    functionName: 'getPair', args: [OCT26, WETH]
  });
  console.log("Pair:", pair);
  if (pair === "0x0000000000000000000000000000000000000000") { console.log("ПУЛУ НЕ ІСНУЄ"); return; }

  const [r0, r1] = await client.readContract({
    address: pair,
    abi: [{ name:'getReserves', type:'function', inputs:[], outputs:[{type:'uint112'},{type:'uint112'},{type:'uint32'}], stateMutability:'view' }],
    functionName: 'getReserves'
  });
  const token0 = await client.readContract({
    address: pair,
    abi: [{ name:'token0', type:'function', inputs:[], outputs:[{type:'address'}], stateMutability:'view' }],
    functionName: 'token0'
  });
  const isOCT26 = token0.toLowerCase() === OCT26.toLowerCase();
  const rOCT26 = isOCT26 ? r0 : r1;
  const rWETH  = isOCT26 ? r1 : r0;
  console.log("Reserve OCT26:", formatUnits(rOCT26, 18));
  console.log("Reserve WETH: ", formatUnits(rWETH, 18));
  console.log("Rate: 1 ETH =", (Number(formatUnits(rOCT26,18))/Number(formatUnits(rWETH,18))).toFixed(2), "OCT26");
}
main().catch(console.error);
