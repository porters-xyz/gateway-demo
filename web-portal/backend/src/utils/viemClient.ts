import { createPublicClient, http } from 'viem';
import { optimism, base, gnosis } from 'viem/chains';

export const opClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const gnosisClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});
