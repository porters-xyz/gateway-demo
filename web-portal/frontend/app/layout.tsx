// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { Web3Provider } from "@frontend/utils/web3provider";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

export const metadata = {
  title: "Gateway Demo Portal",
  description: "Welcome",
};

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
