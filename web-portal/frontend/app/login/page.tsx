"use client";
import { Container, Button, TextInput } from "@mantine/core";
import { RecoverTenantModal } from "./modal.component";
import { ConnectKitButton, useSIWE } from "connectkit";
import Link from "next/link";

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
      <ConnectKitButton />
      <Link href={"?recover=true"}>Recover</Link>
      <RecoverTenantModal />
    </Container>
  );
}
