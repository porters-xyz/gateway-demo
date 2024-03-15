"use client";
import { Button } from "@mantine/core";
import { signOut } from "@frontend/utils/siwe.actions";

export default function LogoutButton() {
  return (
    <>
      <form onSubmit={signOut}>
        <Button type="submit" variant="outline" color="umbra.1">
          Logout
        </Button>
      </form>
    </>
  );
}
