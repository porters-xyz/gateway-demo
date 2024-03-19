"use client";
import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Flex, Button, Title, Stack, Text, Tabs } from "@mantine/core";
import Link from "next/link";
import LogoutButton from "./logout";
import { useSIWE } from "connectkit";
import { useRouter } from "next/navigation";
import { useUserApps } from "./hooks";
import _ from "lodash";
import { IconChevronRight } from "@tabler/icons-react";

const tabs = ["Insights", "My Apps", "Usage"];

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
    <Stack>
      <Suspense fallback={<div>Loading...</div>} />
      <NewAppModal />

      {/* <Tabs
        value={""}
        onChange={(value) => router.push(`#${value}`)}
        color="umbra.1"
      >
        <Tabs.List maw={"600px"} style={{ borderRadius: 8 }}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab} value={tab.replace(" ", "")}>
              {tab}
            </Tabs.Tab>
          ))}
        </Tabs.List> */}
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
      {/* </Tabs> */}
    </Stack>
  );
}
