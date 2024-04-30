import { createPublicClient, http } from 'viem';
import { optimism, sepolia } from 'viem/chains';

export const viemOPClient = createPublicClient({
  chain: optimism,
  transport: http('https://optimism-mainnet.rpc.grove.city/v1/' + process.env.RPC_KEY!),
});

export const viemSepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.rpc.grove.city/v1/' + process.env.RPC_KEY!),
});
