import React from "react";
import { Stack, Table, Flex, Title, Card, Button } from "@mantine/core";
import { IApp } from "@frontend/utils/types";
import { IconChevronRight } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { appsAtom } from "@frontend/utils/atoms";
import Link from "next/link";
import StyledLink from "./styledlink";

const AppList: React.FC = () => {
  const list = useAtomValue(appsAtom) as IApp[];
  const path = usePathname();
  const router = useRouter();
  const showAll = path === "/apps";
  const rows = list.map((app: IApp) => (
    <Table.Tr
      key={app.name}
      onClick={() => router.replace("apps/" + app.id)}
      style={{ cursor: "pointer" }}
    >
      <Table.Th>{app.name ?? "Un-named App"}</Table.Th>
      <Table.Td>{app.id}</Table.Td>
      <Table.Td>{app.active ? "Yes" : "No"}</Table.Td>
      <Table.Td>{app.createdAt}</Table.Td>
    </Table.Tr>
  ));

  if (list.length == 0) {
    return (
      <Stack>
        <Flex justify={"space-between"} align={"center"}>
          <Title order={3}>My Apps</Title>
        </Flex>
        <Stack align="center" justify="center" h="100%" py={100} bg="#fff">
          <Title order={2} lh={1.2} style={{ textAlign: "center" }}>
            Go ahead,
            <br />
            Create your first app!
          </Title>
          <Link href="?new=app" style={{ padding: 16 }}>
            <Button>{"Create App"}</Button>
          </Link>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Flex justify={"space-between"} align={"center"}>
          <Title order={3}>My Apps</Title>
          {!showAll && (
            <StyledLink link={"/apps"}>
              View all <IconChevronRight size={16} />
            </StyledLink>
          )}
        </Flex>
        <Table
          highlightOnHover
          highlightOnHoverColor="#00000004"
          horizontalSpacing="xl"
          verticalSpacing="md"
          style={{ background: "#FEFCFA", borderRadius: 5 }}
        >
          <Table.Thead c="umbra.1">
            <Table.Tr>
              <Table.Th style={{ fontWeight: "normal" }}>App Name</Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>App id</Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>Active</Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>Created At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    );
  }
};

export default AppList;
