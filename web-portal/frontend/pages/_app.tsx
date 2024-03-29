import "@mantine/core/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { siweConfig } from "@frontend/utils/siwe";
import { MantineProvider } from "@mantine/core";
import Web3Provider, { config, projectId } from "@frontend/utils/Web3Provider";
import { theme } from "@frontend/utils/theme";
import { createWeb3Modal } from "@web3modal/wagmi/react";

createWeb3Modal({
  siweConfig,
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Head>
        <title>Porters RPC SDK</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="fav icon" href="/favicon.ico" />
      </Head>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </MantineProvider>
  );
}
