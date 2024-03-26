import { Stack } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { useParams } from "next/navigation";

export default function App() {
  const params = useParams();
  return (
    <DashboardLayout>
      <Stack>{params?.app}</Stack>
    </DashboardLayout>
  );
}
