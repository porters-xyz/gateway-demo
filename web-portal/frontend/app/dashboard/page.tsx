"use client";
import AppList from "./applist";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Flex, Title, Stack, Text } from "@mantine/core";
import { useSIWE } from "connectkit";
import { useRouter } from "next/navigation";
import { useUserApps } from "./hooks";
import _ from "lodash";
import { IconChevronRight } from "@tabler/icons-react";

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
      <NewAppModal />

      <Stack>
        <Flex justify={"space-between"}>
          <Title order={3}>My Apps</Title>
          <Text
            size="sm"
            fw={500}
            c="dimmed"
            style={{ display: "flex", alignItems: "center" }}
          >
            View all <IconChevronRight size={16} />
          </Text>
        </Flex>
        {apps && <AppList list={apps} />}
      </Stack>
    </Stack>
  );
}
