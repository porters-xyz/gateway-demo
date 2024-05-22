import {
    Breadcrumbs,
    Button,
    Flex,
    Stack,
    Text,
    Title,
    Tooltip,
    CopyButton,
    Input
} from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { appsAtom } from "@frontend/utils/atoms";
import { IApp } from "@frontend/utils/types";
import StyledLink from "@frontend/components/dashboard/styledlink";
import AppTabs from "@frontend/components/apps/apptabs";

import UpdateAppModal from "@frontend/components/apps/updateAppModal";
import { useAppUsage } from "@frontend/utils/hooks";

const appsRootUrl = [
    {
        title: "My Apps",
        href: "/apps",
    },
];

export default function App() {
    const appId = _.get(useParams(), "app");
    const apps: Array<IApp> = useAtomValue(appsAtom);
    const app = _.find(apps, { id: appId }) as IApp;

    const path = usePathname();
    const router = useRouter();

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
            <UpdateAppModal name={app?.name} description={app?.description} />
            <Stack gap={20}>
                <Breadcrumbs>{breadCrumbItems}</Breadcrumbs>

                <Flex justify="space-between" align="center">
                <Flex align="center" gap={10}>
                <Stack gap={2}>
                  <Text opacity={0.5}>App Name</Text>
                  <Flex align='center' gap={20}>
                    <Title order={1} maw={700}>
                        {_.get(app, "name")}
                    </Title>
                    <CopyButton value={app.id}>
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied ? "Copied AppId" : "Copy AppId"}
                          bg={copied ? "orange" : "black"}
                        >
                          <Input
                            value={app.id}
                            w={100}
                            readOnly
                            styles={{
                              input:{
                                backgroundColor: '#ffffff50',
                              },
                              wrapper:
                              {
                                cursor: "pointer"
                              }
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
                        color="umbra.1"
                    >
                        Update
                    </Button>
                </Flex>
                <Tooltip.Floating
                    label={_.get(app, "description")}
                    bg="black"
                    position="right"
                    multiline
                    maw={320}
                    mt={20}
                    opacity={
                        Boolean(_.get(app, "description")?.length < 100)
                            ? 0.0
                            : 1
                    }
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
