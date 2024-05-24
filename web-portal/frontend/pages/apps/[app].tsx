import {
  Breadcrumbs,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
  CopyButton,
  Input,
  Alert,
} from "@mantine/core";
import { IconAlertOctagon } from "@tabler/icons-react";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { appsAtom } from "@frontend/utils/atoms";
import { IApp } from "@frontend/utils/types";
import StyledLink from "@frontend/components/dashboard/styledlink";
import AppTabs from "@frontend/components/apps/apptabs";
import { useAppAlert } from "@frontend/utils/hooks";
import UpdateAppModal from "@frontend/components/apps/updateAppModal";

const appsRootUrl = [
  {
    title: "My Apps",
    href: "/apps",
  },
];

export default function App({ appId }: { appId: string }) {
  const apps: Array<IApp> = useAtomValue(appsAtom);

  const app = _.find(apps, { id: appId }) as IApp;

  const path = usePathname();
  const router = useRouter();
  const { data: appAlertCheck } = useAppAlert(appId);

  const showAppAlert = Number(
    _.last(_.get(_.first(_.get(appAlertCheck, "data.result")), "value")),
  );

  const breadCrumbItems = _.map(
    [
      ...appsRootUrl,
      {
        title: _.get(app, "name", ""),
        href: `/apps/${_.get(app, "id", "")}`,
      },
    ],
    (item, index) => (
      <StyledLink link={_.get(item, "href")} key={index}>
        <Text>{_.get(item, "title").toUpperCase()}</Text>
      </StyledLink>
    ),
  );

  return (
    <DashboardLayout>
      {Boolean(showAppAlert) && (
        <Alert
          color="blue"
          title="Balance Low"
          icon={<IconAlertOctagon />}
          my={32}
          bg="#F9DCBF"
        >
          You app maybe getting rate-limited!
        </Alert>
      )}
      <UpdateAppModal name={app?.name} description={app?.description} />
      <Stack gap={20}>
        <Breadcrumbs>{breadCrumbItems}</Breadcrumbs>

        <Flex justify="space-between" align="center">
          <Flex align="center" gap={10}>
            <Stack gap={2}>
              <Text opacity={0.5}>App Name</Text>
              <Flex align="center" gap={20}>
                <Title order={1} maw={700}>
                  {_.get(app, "name")}
                </Title>
                <CopyButton value={app?.id}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? "Copied AppId" : "Copy AppId"}
                      bg={copied ? "orange" : "black"}
                    >
                      <Input
                        value={app?.id}
                        w={100}
                        readOnly
                        styles={{
                          input: {
                            backgroundColor: "#ffffff50",
                          },
                          wrapper: {
                            cursor: "pointer",
                          },
                        }}
                        onClick={copy}
                      />
                    </Tooltip>
                  )}
                </CopyButton>
              </Flex>
            </Stack>
          </Flex>
          <Button
            onClick={() => router.replace(`${path}?edit=1`)}
            variant="outline"
            color="#856853"
          >
            Edit
          </Button>
        </Flex>
        <Tooltip.Floating
          label={_.get(app, "description")}
          bg="black"
          position="right"
          multiline
          maw={320}
          mt={20}
          opacity={Boolean(_.get(app, "description")?.length < 100) ? 0.0 : 1}
        >
          <Text c="umbra" maw={600}>
            <Text opacity={0.5}>Description {` `}</Text>
            {_.truncate(_.get(app, "description"), {
              length: 100,
            })}
          </Text>
        </Tooltip.Floating>
        <AppTabs />
      </Stack>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ params }: { params: any }) => {
  const appIdFromParams = _.get(params, "app");

  return {
    props: {
      appId: appIdFromParams,
    },
  };
};
