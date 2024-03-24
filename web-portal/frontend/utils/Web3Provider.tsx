"use client";
import { APP_NAME } from "@frontend/utils/consts";
import { FC, PropsWithChildren } from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  fallback,
  cookieStorage,
  createStorage,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet } from "wagmi/chains";
import {
  getNonce,
  getSession,
  signOut,
  verifyMessage,
  createMessage,
} from "@frontend/utils/siwe.actions";
import {
  ConnectKitProvider,
  SIWEConfig,
  SIWEProvider,
  getDefaultConfig,
} from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    appName: APP_NAME,
    transports: {
      [mainnet.id]: fallback([http(process.env.NEXT_PUBLIC_RPC_ENDPOINT)]),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  }),
);
const queryClient = new QueryClient();

// TODO: check if some of these can be handled via nextjs server action
const siweConfig = {
  getNonce,
  createMessage,
  verifyMessage,
  getSession,
  signOut,
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
