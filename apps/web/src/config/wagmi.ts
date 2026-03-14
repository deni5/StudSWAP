"use client";

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { sepolia } from 'wagmi/chains';

export const appWagmiConfig = getDefaultConfig({
  appName: 'StudSWAP',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '***',
  chains: [sepolia],
  transports: { [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || '') },
});
