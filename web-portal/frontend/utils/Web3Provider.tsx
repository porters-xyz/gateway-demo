import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { base, gnosis, mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { State, WagmiProvider } from "wagmi";
import { ReactNode } from "react";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const envVariables = { projectId, NEXT_PUBLIC_APP_URL };

Object.entries(envVariables).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
});


const metadata = {
  name: "Porters RPC Gateway",
  description: "Porters RPC Gateway",
  url: String(NEXT_PUBLIC_APP_URL),
  icons: ["https://staging.porters.xyz/favicon.ico"],
};

// Create wagmiConfig
export const chains = [mainnet, optimism, base, gnosis] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const queryClient = new QueryClient();

export default function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>{children}</JotaiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
