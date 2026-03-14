import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

export const viemPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? sepolia.rpcUrls.default.http[0]),
});
