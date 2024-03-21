"use client";
import AppList from "./applist";
import { Suspense } from "react";
import { Flex, Title, Stack, Text } from "@mantine/core";
import { useSIWE } from "connectkit";
import { useRouter } from "next/navigation";
import { useUserApps } from "./hooks";
import _ from "lodash";

import Insights from "./insights";
import CreateAppModal from "./createAppModal";

// const tabs = ["Insights", "My Apps", "Usage"];

export default function User() {
  const { data, isSignedIn } = useSIWE();

  const router = useRouter();

  const { data: apps } = useUserApps(data?.address);

  if (!isSignedIn) {
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  return (
    <Stack>
      <Suspense fallback={<div>Loading...</div>} />
      <CreateAppModal />

      <Insights />

      {apps && <AppList list={apps} />}
    </Stack>
  );
}
