import "@mantine/core/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import Web3Provider from "@frontend/utils/Web3Provider";
import { theme } from "@frontend/utils/theme";

import { usePathname } from "next/navigation";

export default function App({ Component, pageProps }: AppProps) {
    const path = usePathname();

    return (
        <MantineProvider theme={theme}>
            <Head>
                <title>Porters RPC Gateway</title>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
                <link rel="fav icon" href="/favicon.ico" />
            </Head>
            {path === "/" ? (
                <Component {...pageProps} />
            ) : (
                <Web3Provider>
                    <Component {...pageProps} />
                </Web3Provider>
            )}
        </MantineProvider>
    );
}
