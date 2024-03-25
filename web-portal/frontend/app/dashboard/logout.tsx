"use client";
import { Button } from "@mantine/core";
import { useDisconnect } from "wagmi";

export default function LogoutButton() {
  const { disconnect } = useDisconnect();
  return (
    <>
      <form onSubmit={() => disconnect()}>
        <Button type="submit" variant="outline" color="umbra.1">
          Logout
        </Button>
      </form>
    </>
  );
}
