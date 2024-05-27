import { ConnectKitProvider, SIWEProvider, getDefaultConfig } from "connectkit";
import { base, gnosis, mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import {  WagmiProvider, createConfig, http } from "wagmi";
import { ReactNode } from "react";
import { siweConfig } from "./siwe";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const envVariables = { projectId, NEXT_PUBLIC_APP_URL };

Object.entries(envVariables).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
});

// Create wagmiConfig
export const chains = [mainnet, optimism, base, gnosis] as const;

export const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, base, gnosis, optimism],
    transports: {
      [mainnet.id]: http(
          `https://eth-mainnet.rpc.grove.city/v1/1eec3963`
      ),
      [base.id]: http(`https://base-mainnet.rpc.grove.city/v1/1eec3963`),
      [gnosis.id]: http(`https://gnosischain-mainnet.rpc.grove.city/v1/1eec3963`),
      [optimism.id]: http(`https://optimism-mainnet.rpc.grove.city/v1/1eec3963`),
    },
    walletConnectProjectId: projectId,
    appName: "Porters RPC Gateway",
    appDescription: "Porters RPC Gateway",
    appUrl:  String(NEXT_PUBLIC_APP_URL),
    appIcon: 'https://porters.xyz/favicon.ico'
  }));

export const queryClient = new QueryClient();

export default function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  return (
     <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
        <SIWEProvider {...siweConfig}>
        <ConnectKitProvider>
        {children}
        </ConnectKitProvider>
        </SIWEProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
