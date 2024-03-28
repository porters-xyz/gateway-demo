import AppList from "@frontend/components/dashboard/applist";
import { Stack } from "@mantine/core";
import { useUserApps } from "@frontend/utils/hooks";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import CreateAppModal from "@frontend/components/dashboard/createAppModal";
import { sessionAtom } from "@frontend/utils/atoms";
import { useAtomValue } from "jotai";

export default function User() {
  const session = useAtomValue(sessionAtom);

  const { data: apps } = useUserApps(String(session?.address));

  return (
    <DashboardLayout>
      <Stack>
        <CreateAppModal />
        {apps && <AppList list={apps} />}
      </Stack>
    </DashboardLayout>
  );
}
