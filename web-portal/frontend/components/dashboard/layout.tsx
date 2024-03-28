import {
  AppShell,
  Burger,
  Group,
  Container,
  Flex,
  Title,
  Button,
  Stack,
} from "@mantine/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import logo from "@frontend/public/logo.png";
import NavLink from "./navlink";
import {
  IconBook,
  IconApps,
  IconHome,
  IconAdjustmentsAlt,
  IconHeadset,
  IconSwitch,
  IconBrandPaypay,
  IconReceipt,
} from "@tabler/icons-react";
import { useEffect } from "react";
import Image from "next/image";
import LogoutButton from "@frontend/components/dashboard/logout";
import { useSession, useUserApps } from "@frontend/utils/hooks";
import { useAtom, useSetAtom } from "jotai";
import { appsAtom, sessionAtom } from "@frontend/utils/atoms";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { data: sessionValue } = useSession();
  const [session, setSession] = useAtom(sessionAtom);

  const setApps = useSetAtom(appsAtom);
  const { data: appsData } = useUserApps(sessionValue?.address);
  useEffect(() => {
    if (sessionValue?.address) {
      setSession(sessionValue);
    }
  }, [sessionValue]);

  useEffect(() => {
    if (appsData) {
      setApps(appsData);
    }
  }, [appsData]);

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
            Welcome, {String(session?.address).substring(0, 10)}
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
        <Stack justify="space-between" h={"100%"}>
          <Group style={{ marginTop: 32, gap: 2 }}>
            <NavLink
              icon={<IconHome size={16} style={{ marginRight: 8 }} />}
              label="Dashboard"
              link="/dashboard"
            />
            <NavLink
              icon={<IconApps size={16} style={{ marginRight: 8 }} />}
              label="My Apps"
              link="/apps"
            />
            <NavLink
              icon={<IconAdjustmentsAlt size={16} style={{ marginRight: 8 }} />}
              label="Settings"
              link="/settings"
            />
            <NavLink
              icon={<IconSwitch size={16} style={{ marginRight: 8 }} />}
              label="Swap or Redeem"
              link="/swap"
            />
            <NavLink
              icon={<IconReceipt size={16} style={{ marginRight: 8 }} />}
              label="Billing"
              link="/billing"
            />
          </Group>
          <Group style={{ gap: 2 }}>
            <NavLink
              icon={<IconBook size={16} style={{ marginRight: 8 }} />}
              label="Docs"
              link="/docs"
            />
            <NavLink
              icon={<IconHeadset size={16} style={{ marginRight: 8 }} />}
              label="Discord"
              link="/discord"
            />
          </Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size={"xl"}>{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
