import React from "react";
import { Table } from "@mantine/core";
import { IApp } from "@frontend/utils/types";

const AppList: React.FC<{ list: Array<IApp> }> = ({ list }) => {
  const rows = list.map((app: IApp) => (
    <Table.Tr key={app.name}>
      <Table.Th>{app.name ?? "Un-named App"}</Table.Th>
      <Table.Td>{app.id}</Table.Td>
      <Table.Td>{app.active ? "Yes" : "No"}</Table.Td>
      <Table.Td>{app.createdAt}</Table.Td>
    </Table.Tr>
  ));

  return (
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
  );
};

export default AppList;
