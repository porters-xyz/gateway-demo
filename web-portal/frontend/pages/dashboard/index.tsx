import AppList from "@frontend/components/dashboard/applist";
import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import Insights from "@frontend/components/dashboard/insights";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Stack gap={32}>
        <Insights />
        <AppList />
      </Stack>
    </DashboardLayout>
  );
}
