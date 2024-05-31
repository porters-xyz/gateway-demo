import { createPublicClient, http } from 'viem';
import { optimism, base, gnosis, taiko } from 'viem/chains';

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

export const taikoClient = createPublicClient({
  chain: taiko,
  transport: http(),
});
