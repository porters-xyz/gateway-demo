"use client";
import { Container, Flex, TextInput, Title } from "@mantine/core";
import { RecoverTenantModal } from "./modal.component";
import { ConnectKitButton, useSIWE } from "connectkit";
import Image from "next/image";
import logo from "@frontend/public/logo.png";
import Link from "next/link";
import WelcomeShape from "./welcomeShape.component";

export default function Login() {
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
        <ConnectKitButton />
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
