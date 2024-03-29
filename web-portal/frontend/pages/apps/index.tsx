import AppList from "@frontend/components/dashboard/applist";
import { Stack } from "@mantine/core";

import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import CreateAppModal from "@frontend/components/dashboard/createAppModal";
export default function User() {
  return (
    <DashboardLayout>
      <Stack>
        <CreateAppModal />
        <AppList />
      </Stack>
    </DashboardLayout>
  );
}
