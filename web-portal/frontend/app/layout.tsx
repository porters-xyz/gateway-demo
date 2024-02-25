"use client";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports

import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Web3Provider from "./Web3Provider";
import { metadata } from "@frontend/utils/consts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Web3Provider>
          <MantineProvider>{children}</MantineProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
