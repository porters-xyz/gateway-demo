"use client";
import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Flex, Button, Title } from "@mantine/core";
import Link from "next/link";
import LogoutButton from "./logout";
import { useSIWE } from "connectkit";
import { useRouter } from "next/navigation";
import { useUserApps } from "./hooks";
import _ from "lodash";

export default function User() {
  const { data, isReady, isSignedIn } = useSIWE();

  const router = useRouter();

  const { data: apps } = useUserApps(data?.address);

  if (!isSignedIn) {
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <NewAppModal />
        <Flex
          justify={"space-between"}
          align={"center"}
          style={{ marginBottom: 20 }}
        >
          <Title order={5}>logged in as: {data?.address}</Title>
          <Flex gap="md">
            <Link href="?new=app">
              <Button color="carrot.1">New App</Button>
            </Link>
            <LogoutButton />
          </Flex>
        </Flex>
        {apps && <AppList list={apps} />}
      </Suspense>
    </>
  );
}
