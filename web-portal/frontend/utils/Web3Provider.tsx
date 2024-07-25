import { ConnectKitProvider, SIWEProvider, getDefaultConfig } from "connectkit";
import { base, gnosis, mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import {  WagmiProvider, createConfig, http } from "wagmi";
import { ReactNode } from "react";
import { siweConfig } from "./siwe";
import { connectKitTheme } from "@frontend/styles/connectkit-theme";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const ETH_MAINNET_NODE = process.env.ETH_MAINNET_NODE;
export const ETH_BASE_NODE = process.env.ETH_BASE_NODE;
export const ETH_GNOSIS_NODE = process.env.ETH_GNOSIS_NODE;
export const ETH_OPTIMISM_NODE = process.env.ETH_OPTIMISM_NODE;

// Create wagmiConfig
export const chains = [mainnet, optimism, base, gnosis] as const;

export const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, base, gnosis, optimism],
    transports: {
      [mainnet.id]: http(ETH_MAINNET_NODE),
      [base.id]: http(ETH_BASE_NODE),
      [gnosis.id]: http(ETH_GNOSIS_NODE),
      [optimism.id]: http(ETH_OPTIMISM_NODE),
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
        <ConnectKitProvider customTheme={connectKitTheme}>
        {children}
        </ConnectKitProvider>
        </SIWEProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
