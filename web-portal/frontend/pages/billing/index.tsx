import InvoiceList from "@frontend/components/billing/invoiceList";
import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { billingHistoryAtom, sessionAtom } from "@frontend/utils/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useBillingHistory } from "@frontend/utils/hooks";
export default function BillingHistory() {
  const session = useAtomValue(sessionAtom);
  const { data: billingHistoryData } = useBillingHistory(
    session?.tenantId as string,
  );
  const [billingHistory, setBillingHistory] = useAtom(billingHistoryAtom);
  if (billingHistoryData) {
    setBillingHistory(billingHistoryData);
  }

  return (
    <DashboardLayout>
      <Stack>{/* <InvoiceList /> */}</Stack>
    </DashboardLayout>
  );
}
