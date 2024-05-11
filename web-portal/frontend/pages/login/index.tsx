import background from "@frontend/public/background.png";
import { Button, Container, Title, Box, BackgroundImage } from "@mantine/core";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import logo from "@frontend/public/logo.png";
import WelcomeShape from "@frontend/components/login/welcomeshape";
import { useAccount, useDisconnect } from "wagmi";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@frontend/utils/atoms";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { open } = useWeb3Modal();
  const router = useRouter();
  const session = useAtomValue(sessionAtom);
  const { isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (session?.address) {
      router.replace("/dashboard");
    }
  }, [session?.address, router]);

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
        </Container>
      </BackgroundImage>
    </Box>
  );
}
