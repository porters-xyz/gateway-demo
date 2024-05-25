import background from "@frontend/public/background.png";
import { Button, Container, Title, Box, BackgroundImage } from "@mantine/core";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import logo from "@frontend/public/logo.png";
import WelcomeShape from "@frontend/components/login/welcomeshape";
import poweredByPokt from "@frontend/public/powered-by-pokt.png";
import { useAccount, useDisconnect } from "wagmi";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@frontend/utils/atoms";

export default function Login() {
  const { open } = useWeb3Modal();
  const session = useAtomValue(sessionAtom);
  const { isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Box style={{ backgroundColor: "#3C2B27" }}>
      <BackgroundImage src={background.src}>
        <Container
          style={{
            height: "100vh",
            width: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <WelcomeShape>
            <Image src={logo.src} alt="hello" width="160" height="58" />
            <Title order={2} style={{ color: "white", textAlign: "center" }}>
              Welcome to Porters. Let’s get started!
            </Title>
            <Button
              onClick={() => {
                Boolean(!session?.address) ? open() : disconnect();
              }}
            >
              {isConnecting
                ? "Connecting"
                : Boolean(session?.address)
                  ? "Disconnect"
                  : "Connect Wallet"}
            </Button>
          </WelcomeShape>
          <Container
            style={{
              position: "absolute",
              bottom: 30,
            }}
          >
            <Image
              src={poweredByPokt.src}
              width={poweredByPokt.width * 0.35}
              height={poweredByPokt.height * 0.35}
              alt="Powered By Pokt Network"
            />
          </Container>
        </Container>
      </BackgroundImage>
    </Box>
  );
}
