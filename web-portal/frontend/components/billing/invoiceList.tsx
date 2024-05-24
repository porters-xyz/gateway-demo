import React from "react";
import { Stack, Table, Flex, Title, Card, Button } from "@mantine/core";
import { IBill } from "@frontend/utils/types";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { billingHistoryAtom, sessionAtom } from "@frontend/utils/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useBillingHistory } from "@frontend/utils/hooks";

const InvoiceList: React.FC = () => {
  const router = useRouter();

  const session = useAtomValue(sessionAtom);
  const { data: billingHistoryData } = useBillingHistory(
    session?.tenantId as string,
  );
  const [billingHistory, setBillingHistory] = useAtom(billingHistoryAtom);

  if (billingHistoryData) {
    setBillingHistory(billingHistoryData);
  }

  const rows = billingHistory.map((invoice: IBill) => (
    <Table.Tr
      key={invoice.id}
      onClick={() => router.push("?download=" + invoice.id)}
      style={{ cursor: "pointer" }}
    >
      <Table.Td>{invoice.referenceId}</Table.Td>
      <Table.Th c={invoice.transactionType === "DEBIT" ? "red" : "blue"}>
        {invoice.transactionType}
      </Table.Th>
      <Table.Td>{invoice.amount}</Table.Td>
      <Table.Td>
        {new Date(invoice?.createdAt as string).toLocaleDateString()}
      </Table.Td>
    </Table.Tr>
  ));

  if (billingHistory.length == 0) {
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
