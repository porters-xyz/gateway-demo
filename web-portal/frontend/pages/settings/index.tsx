import DashboardLayout from "@frontend/components/dashboard/layout";
import {
  CopyButton,
  Button,
  Divider,
  Text,
  Stack,
  Title,
  Flex,
  Card,
  ActionIcon,
  Tooltip,
  rem,
} from "@mantine/core";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@frontend/utils/atoms";
import _ from "lodash";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import DisplayItem from "@frontend/components/settings/displayItem";

export default function Settings() {
  const session = useAtomValue(sessionAtom);

  return (
    <DashboardLayout>
      <Stack gap={4} mt={40}>
        <Title c="black">Account</Title>
        <Divider />

        <Stack gap={44} mt={40}>
          <DisplayItem
            title="Sign-in Address"
            description="This is the wallet address associated with your account. You can
          use this address to sign-in and manage your apps."
            value={_.toString(session?.address?.toLowerCase())}
          />

          <DisplayItem
            title="Account Identifier"
            description="This is the account identifier of your account. You need to provide this during redeeming of your PORTR tokens."
            value={_.toString(session?.tenantId)}
          />
          <DisplayItem
            title="Delete my account"
            description="If you wish to delete your account, you can contact us via email"
            value={"hello@porters.xyz"}
          />
        </Stack>
      </Stack>
    </DashboardLayout>
  );
}
