"use client";
import { Button } from "@mantine/core";
export default function LogoutButton() {
  return (
    <>
      <form>
        <Button type="submit" variant="outline" color="umbra.1">
          Logout
        </Button>
      </form>
    </>
  );
}
