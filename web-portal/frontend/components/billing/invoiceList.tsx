import React from "react";
import { Stack, Table, Flex, Title, Card, Button } from "@mantine/core";
import { IApp } from "@frontend/utils/types";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@frontend/utils/atoms";
import Link from "next/link";

const InvoiceList: React.FC = () => {
  const list = useAtomValue(sessionAtom) as IApp[];
  const path = usePathname();
  const router = useRouter();
  const showAll = path === "/apps";
  const rows = list.map((app: IApp) => (
    <Table.Tr
      key={app.name}
      onClick={() => router.push("?download=" + app.id)}
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
          <Title order={3}>Billing History</Title>
        </Flex>
        <Stack align="center" justify="center" h="100%" py={100} bg="#fff">
          <Title order={2} lh={1.2} style={{ textAlign: "center" }}>
            No Billing History Found!
            <br />
            Create your first app!
          </Title>
          <Link href="/swap" style={{ padding: 16 }}>
            <Button>Get PORTR Token</Button>
          </Link>
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Flex justify={"space-between"} align={"center"}>
          <Title order={3}>Billing History</Title>

          <Button onClick={() => router.push("?download=all")}>
            Download All
          </Button>
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
              <Table.Th style={{ fontWeight: "normal" }}>Invoice Id</Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>
                Transaction Type
              </Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>Amount</Table.Th>
              <Table.Th style={{ fontWeight: "normal" }}>Created At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    );
  }
};

export default InvoiceList;
