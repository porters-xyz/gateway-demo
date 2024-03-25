/* eslint-disable */
"use client";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports

import "@mantine/core/styles.css";
import { siweConfig } from "@frontend/utils/siwe.actions";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Web3Provider, { config, projectId } from "@frontend/utils/Web3Provider";
// import { metadata } from "@frontend/utils/consts";
import { theme } from "@frontend/utils/theme";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { useSession } from "@frontend/utils/hooks";
import { useRouter } from "next/navigation";

createWeb3Modal({
  siweConfig,
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Web3Provider>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
