"use client";
import { Button, Container, Title } from "@mantine/core";
import { RecoverTenantModal } from "./modal.component";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import logo from "@frontend/public/logo.png";
import Link from "next/link";
import WelcomeShape from "./welcomeShape.component";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import { useSession } from "@frontend/utils/hooks";

export default function Login() {
  const { open } = useWeb3Modal();
  const { data: session } = useSession();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  if (session?.address) {
    router.replace("/dashboard");
  }

  return (
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
            !session?.address ? open() : disconnect();
          }}
        >
          {session?.address ? "Disconnect" : "Connect Wallet"}
        </Button>
        <Link
          href={"?recover=true"}
          style={{ color: "#FFA44B", textDecorationColor: "#FFA44B" }}
        >
          Recover
        </Link>

        <RecoverTenantModal />
      </WelcomeShape>
    </Container>
  );
}
