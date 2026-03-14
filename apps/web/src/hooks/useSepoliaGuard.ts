import { useChainId } from 'wagmi'

const SEPOLIA_CHAIN_ID = 11155111

export function useSepoliaGuard() {
  const chainId = useChainId()
  const isSepolia = chainId === SEPOLIA_CHAIN_ID
  const isWrongNetwork = chainId !== undefined && chainId !== SEPOLIA_CHAIN_ID
  return { chainId, isSepolia, isWrongNetwork }
}
