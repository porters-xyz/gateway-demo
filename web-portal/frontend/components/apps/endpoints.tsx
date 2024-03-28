import React from "react";
import { Stack, Table, Input } from "@mantine/core";
import { IApp } from "@frontend/utils/types";
import { useAtomValue } from "jotai";
import { appsAtom } from "@frontend/utils/atoms";

const EndpointList: React.FC = () => {
  const list = useAtomValue(appsAtom) as IApp[];
  const rows = list.map((app: IApp) => (
    <Table.Tr key={app.name} style={{ cursor: "pointer" }}>
      <Table.Th>{app.name ?? "Un-named App"}</Table.Th>
      <Table.Td>{app.id}</Table.Td>
      <Table.Td>
        <Input
          value={app.active ? "Yes" : "No"}
          readOnly
          style={{ cursor: "pointer" }}
        />
      </Table.Td>
      <Table.Td>{app.createdAt}</Table.Td>
    </Table.Tr>
  ));

  if (list.length === 0) {
    return <Stack>Loading..</Stack>;
  }

  return (
    <Stack mt={20}>
      <Table
        horizontalSpacing="xl"
        verticalSpacing="md"
        style={{ background: "#FEFCFA", borderRadius: 5 }}
      >
        <Table.Thead c="dimmed">
          <Table.Tr>
            <Table.Th style={{ fontWeight: "normal" }}>Network</Table.Th>
            <Table.Th style={{ fontWeight: "normal" }}>Slug</Table.Th>
            <Table.Th style={{ fontWeight: "normal" }}>Your Endpoint</Table.Th>
            <Table.Th style={{ fontWeight: "normal" }}>Copy</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
};

export default EndpointList;
