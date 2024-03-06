"use client";
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports

import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Web3Provider from "@frontend/utils/Web3Provider";
import { metadata } from "@frontend/utils/consts";
import { theme } from "@frontend/utils/theme";

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
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
