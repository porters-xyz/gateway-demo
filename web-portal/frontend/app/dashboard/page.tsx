"use client";
import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Flex, Button, Title } from "@mantine/core";
import Link from "next/link";
import LogoutButton from "./logout";
import { useSIWE } from "connectkit";

export default function User() {
  const siwe = useSIWE();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {/* <NewAppModal /> */}
        <Flex
          justify={"space-between"}
          align={"center"}
          style={{ marginBottom: 20 }}
        >
          <Title order={5}>logged in as: {"user" || "null"}</Title>
          <Flex gap="md">
            <Link href="?new=app">
              <Button color="carrot.1">New App</Button>
            </Link>
            <LogoutButton />
          </Flex>
        </Flex>
        {/* <AppList list={tenant?.apps} /> */}
      </Suspense>
    </>
  );
}
