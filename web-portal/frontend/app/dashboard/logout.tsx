"use client";
import { Button } from "@mantine/core";
import { signOut } from "@frontend/utils/siwe.actions";
import { useDisconnect } from "wagmi";

export default function LogoutButton() {
  const { disconnectAsync } = useDisconnect();
  return (
    <>
      <form
        onSubmit={async () => {
          await signOut();
          disconnectAsync();
        }}
      >
        <Button type="submit" variant="outline" color="umbra.1">
          Logout
        </Button>
      </form>
    </>
  );
}
