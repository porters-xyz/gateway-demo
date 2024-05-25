import {
  AppShell,
  Burger,
  Group,
  Container,
  Flex,
  Title,
  Stack,
  Alert,
  Skeleton
} from "@mantine/core";

import Link from "next/link";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import logo from "@frontend/public/logo.png";
import NavLink from "./navlink";
import {
  IconBook,
  IconApps,
  IconHome,
  IconSwitch,
  IconReceipt,
  IconBrandDiscord,
  IconArrowUpRight,
  IconAlertOctagon,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect } from "react";
import Image from "next/image";
import LogoutButton from "@frontend/components/dashboard/logout";
import {
  useSession,
  useUserApps,
  useEndpoints,
  useRuleTypes,
  useTenantAlert,
} from "@frontend/utils/hooks";
import { useAtom, useSetAtom } from "jotai";
import {
  appsAtom,
  endpointsAtom,
  ruleTypesAtom,
  sessionAtom,
} from "@frontend/utils/atoms";
import { useAccount, useEnsName } from "wagmi";

import CreateAppModal from "./createAppModal";
import CreateAppButton from "./createApp";
import _ from "lodash";
import { Address } from "viem";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { data: sessionValue } = useSession();
  const { data: endpoints } = useEndpoints();
  const { data: ruletypes } = useRuleTypes();

  const [session, setSession] = useAtom(sessionAtom);
  const { address } = useAccount();
  const setEndpointAtom = useSetAtom(endpointsAtom);
  const setApps = useSetAtom(appsAtom);
  const setRuleTypes = useSetAtom(ruleTypesAtom);
  const { data: appsData } = useUserApps(address as Address);

  const balance = _.get(_.first(_.get(session, "netBalance")), "net", 0);

  useEffect(() => {
    if (sessionValue?.address) {
      setSession(sessionValue);
    }
    if (appsData) {
      setApps(appsData);
    }
    if (endpoints) {
      setEndpointAtom(endpoints);
    }
    if (ruletypes) {
      setRuleTypes(ruletypes);
    }
  }, [
    sessionValue,
    appsData,
    endpoints,
    setApps,
    setSession,
    setEndpointAtom,
    ruletypes,
    setRuleTypes,
    address,
  ]);

  const { data: ensName } = useEnsName({
    address: session?.address,
  });

  const tenantId = _.get(session, "tenantId");

  const { data: tenantAlertCheck } = useTenantAlert(tenantId!);

  const showTenantAlert = Number(
    _.last(_.get(_.first(_.get(tenantAlertCheck, "data.result")), "value")),
  );

  const { width } = useViewportSize();
  const isMobile = width < 600;

  return (
    <AppShell
      header={{ height: 70 }}
      layout="alt"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex w={"full"} justify="space-between" align="center" p={14}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" p={12} />

          <Title order={2} style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Skeleton height={32} radius="md" visible={!session?.address}>
            Welcome
            {session?.address ? (
              !isMobile ? `, ${ensName ? ensName : String(session.address).substring(0, 10)}` : ''
            ) : ''}
            </Skeleton>
          </Title>


          <Flex gap={8}>
            <CreateAppButton />
            <LogoutButton />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="umbra.1" style={{ color: "white" }} px={"2%"}>
        <Link href="/dashboard">
          <Image src={logo.src} alt="hello" width="160" height="58" />
        </Link>
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
              icon={<IconSettings size={16} style={{ marginRight: 8 }} />}
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
              rightIcon={
                <IconArrowUpRight size={16} style={{ marginRight: 8 }} />
              }
              label="Docs"
              link="https://docs.porters.xyz"
            />
            <NavLink
              icon={<IconBrandDiscord size={16} style={{ marginRight: 8 }} />}
              rightIcon={
                <IconArrowUpRight size={16} style={{ marginRight: 8 }} />
              }
              label="Discord"
              link="https://discord.gg/GZywNxPJgd"
            />
          </Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <CreateAppModal />

        <Container size={"xl"}>
          {!!appsData?.length && balance < 1000 && (
            <Alert
              color="blue"
              title="Balance Low"
              icon={<IconAlertOctagon />}
              my={32}
              bg="#F9DCBF"
            >
              Your relay request balance is running low, Please top-up you
              balance by redeeming some PORTR tokens.
            </Alert>
          )}

          {!!showTenantAlert && (
            <Alert
              color="blue"
              title="Rate Limited"
              icon={<IconAlertOctagon />}
              my={32}
              bg="#F9DCBF"
            >
              Some of your apps maybe getting rate-limited
            </Alert>
          )}
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
