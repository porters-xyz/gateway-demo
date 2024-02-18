"use client";
import { WagmiProvider, createConfig } from "wagmi";
import { FC, PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SIWEProvider,
  SIWEConfig,
  ConnectKitProvider,
  getDefaultConfig,
} from "connectkit";
import { SiweMessage } from "siwe";

const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: String(process.env.WALLET_CONNECT_ID) || "",
    appName: "Porters Gateway",
  }),
);

const queryClient = new QueryClient();

const siweConfig = {
  getNonce: async () => {
    const res = await fetch(`/siwe`, { method: "PUT" });
    if (!res.ok) throw new Error("Failed to fetch SIWE nonce");

    return res.text();
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      nonce,
      chainId,
      address,
      version: "1",
      uri: window.location.origin,
      domain: window.location.host,
      statement: "Sign In With Ethereum to prove you control this wallet.",
    }).prepareMessage();
  },
  verifyMessage: ({ message, signature }) => {
    return fetch(`/siwe`, {
      method: "POST",
      body: JSON.stringify({ message, signature }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.ok);
  },
  getSession: async () => {
    const res = await fetch(`/siwe`);
    if (!res.ok) throw new Error("Failed to fetch SIWE session");

    const { address, chainId } = await res.json();
    return address && chainId ? { address, chainId } : null;
  },
  signOut: () => fetch(`/siwe`, { method: "DELETE" }).then((res) => res.ok),
} satisfies SIWEConfig;

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SIWEProvider {...siweConfig}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </SIWEProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
