"use client";
import { Button } from "@mantine/core";
import { logout } from "./actions";
export default function LogoutButton() {
  return (
    <>
      <form action={logout}>
        <Button type="submit" variant="outline">
          {" "}
          Logout
        </Button>
      </form>
    </>
  );
}
