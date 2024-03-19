"use client";
import {
  AppShell,
  Burger,
  Group,
  Box,
  Flex,
  Title,
  Button,
} from "@mantine/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import logo from "@frontend/public/logo.png";
import { useSIWE } from "connectkit";
import {
  IconBook,
  IconApps,
  IconHome,
  IconAdjustmentsAlt,
  IconHeadset,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import LogoutButton from "./logout";

const tabs = [
  {
    link: "/dashboard",
    label: "Dashboard",
    icon: <IconHome size={16} style={{ marginRight: 8 }} />,
  },
  {
    link: "#apps",
    label: "My Apps",
    icon: <IconApps size={16} style={{ marginRight: 8 }} />,
  },
  {
    link: "/docs",
    label: "Docs",
    icon: <IconBook size={16} style={{ marginRight: 8 }} />,
  },
  {
    link: "/support",
    label: "Support",
    icon: <IconHeadset size={16} style={{ marginRight: 8 }} />,
  },
  {
    link: "/settings",
    label: "Settings",
    icon: <IconAdjustmentsAlt size={16} style={{ marginRight: 8 }} />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const path = usePathname();
  const router = useRouter();
  const { data, isReady, isSignedIn } = useSIWE();

  const links = tabs.map(({ link, label, icon }) => (
    <Box
      key={link}
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        textDecoration: "none",
        color: "white",
        width: "100%",
        padding: 5,
        borderRadius: 4,
        backgroundColor: path === link ? "#00000030" : "none",
      }}
      onClick={() => router.replace(link)}
    >
      {icon}
      {label}
    </Box>
  ));

  return (
    <AppShell
      header={{ height: 80 }}
      layout="alt"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          p={12}
        />
        <Flex justify={"space-between"} align={"center"} h="100%" px={"2%"}>
          <Title order={2}>
            Welcome, {(data?.address as string).substring(0, 10)}
          </Title>
          <Flex gap="md">
            <Link href="?new=app">
              <Button>Create App</Button>
            </Link>
            <LogoutButton />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="umbra.1" style={{ color: "white" }} px={"2%"}>
        <Image src={logo.src} alt="hello" width="160" height="58" />
        <Group style={{ marginTop: 32, gap: 2 }}>{links}</Group>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
