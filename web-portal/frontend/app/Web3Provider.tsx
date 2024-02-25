"use client";
import { SiweMessage } from "siwe";
import { APP_NAME } from "@frontend/utils/consts";
import { FC, PropsWithChildren } from "react";
import { WagmiProvider, createConfig, http, fallback } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet } from "wagmi/chains";
import {
  ConnectKitProvider,
  SIWEConfig,
  SIWEProvider,
  getDefaultConfig,
} from "connectkit";
import { apiUrl } from "@frontend/utils/consts";
const config = createConfig(
  getDefaultConfig({
    appName: APP_NAME,
    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    transports: {
      [mainnet.id]: fallback([
        http(`https://eth-mainnet.rpc.grove.city/v1/c85e7a42`),
      ]),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! ??
      "6bb9e2bb68b85c433de616ea816c7190",
  }),
);
const queryClient = new QueryClient();

// TODO: check if some of these can be handled via nextjs server action
const siweConfig = {
  getNonce: async () => {
    const res = await fetch(apiUrl + `siwe`, { method: "PUT" });
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
  verifyMessage: async ({ message, signature }) => {
    return fetch(apiUrl + `siwe`, {
      method: "POST",
      body: JSON.stringify({ message, signature }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.ok);
  },
  getSession: async () => {
    const res = await fetch(apiUrl + `siwe`);
    if (!res.ok) throw new Error("Failed to fetch SIWE session");

    const { address, chainId } = await res.json();
    return address && chainId ? { address, chainId } : null;
  },
  signOut: () =>
    fetch(apiUrl + `siwe`, { method: "DELETE" }).then((res) => res.ok),
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
