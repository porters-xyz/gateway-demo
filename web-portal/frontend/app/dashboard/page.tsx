"use client";
import AppList from "./applist";
import { Suspense } from "react";
import { Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useUserApps } from "./hooks";
import _ from "lodash";

import Insights from "./insights";
import CreateAppModal from "./createAppModal";
import { useSession } from "@frontend/utils/hooks";

// const tabs = ["Insights", "My Apps", "Usage"];

export default function User() {
  const { data: session } = useSession();

  const router = useRouter();

  const { data: apps } = useUserApps(String(session?.address));

  if (!session?.address) {
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
