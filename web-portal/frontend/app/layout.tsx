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
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Karla:ital,wght@0,200..800;1,200..800&display=swap"
        rel="stylesheet"
      />

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
