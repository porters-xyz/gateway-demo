import InvoiceList from "@frontend/components/billing/invoiceList";
import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { billingHistoryAtom } from "@frontend/utils/atoms";
import { useAtom } from "jotai";
export default function BillingHistory() {
  const [billingHistory, setBillingHistory] = useAtom(billingHistoryAtom);

  return (
    <DashboardLayout>
      <Stack>
        <InvoiceList />
      </Stack>
    </DashboardLayout>
  );
}
