"use client";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { State, WagmiProvider } from "wagmi";
import { ReactNode } from "react";
import { useSession } from "./hooks";

export const projectId = String(
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
);

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Porters RPC Gateway",
  description: "Porters RPC Gateway",
  url: "http://localhost:3000",
  icons: ["https://porters.io/favicon.ico"],
};

// Create wagmiConfig
const chains = [mainnet, sepolia] as const;
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
