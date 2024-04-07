import InvoiceList from "@frontend/components/billing/invoiceList";
import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";

export default function Apps() {
  return (
    <DashboardLayout>
      <Stack>
        <InvoiceList />
      </Stack>
    </DashboardLayout>
  );
}
