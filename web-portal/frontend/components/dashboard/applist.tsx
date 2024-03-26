import React from "react";
import { Stack, Table, Flex, Title, Text } from "@mantine/core";
import { IApp } from "@frontend/utils/types";
import { IconChevronRight } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

const AppList: React.FC<{ list: Array<IApp> }> = ({ list }) => {
  const path = usePathname();
  const router = useRouter();
  const showAll = path === "/apps";
  const rows = list.map((app: IApp) => (
    <Table.Tr key={app.name} onClick={() => router.replace("apps/" + app.id)}>
      <Table.Th>{app.name ?? "Un-named App"}</Table.Th>
      <Table.Td>{app.id}</Table.Td>
      <Table.Td>{app.active ? "Yes" : "No"}</Table.Td>
      <Table.Td>{app.createdAt}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Flex justify={"space-between"}>
        <Title order={3}>My Apps</Title>
        {!showAll && (
          <Text
            size="sm"
            fw={500}
            c="dimmed"
            style={{ display: "flex", alignItems: "center" }}
          >
            View all <IconChevronRight size={16} />
          </Text>
        )}
      </Flex>
      <Table
        horizontalSpacing="xl"
        verticalSpacing="md"
        style={{ background: "#FEFCFA", borderRadius: 5 }}
      >
        <Table.Thead c="dimmed">
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
};

export default AppList;
