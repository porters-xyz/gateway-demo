import { http, createConfig, Config } from '@wagmi/core';
import { optimism } from '@wagmi/core/chains';

export const config: Config = createConfig({
  chains: [optimism],
  transports: {
    [optimism.id]: http(),
  },
});
