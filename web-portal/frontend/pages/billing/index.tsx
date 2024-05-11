import InvoiceList from "@frontend/components/billing/invoiceList";
import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import InvoicePreview from "@frontend/components/billing/invoicePreview";
export default function BillingHistory() {
  return (
    <DashboardLayout>
      <InvoicePreview />
      <Stack>
        <InvoiceList />
      </Stack>
    </DashboardLayout>
  );
}
