import AppList from "@frontend/components/dashboard/applist";
import { Stack } from "@mantine/core";
import { useUserApps } from "@frontend/utils/hooks";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import Insights from "@frontend/components/dashboard/insights";
import CreateAppModal from "@frontend/components/dashboard/createAppModal";
import { useSession } from "@frontend/utils/hooks";

export default function User() {
  const { data: session } = useSession();

  const { data: apps } = useUserApps(String(session?.address));

  return (
    <DashboardLayout>
      <Stack>
        <CreateAppModal />
        <Insights />
        {apps && <AppList list={apps} />}
      </Stack>
    </DashboardLayout>
  );
}
