import { Breadcrumbs, Stack, Text, Title, Tooltip } from "@mantine/core";
import _ from "lodash";
import DashboardLayout from "@frontend/components/dashboard/layout";
import { useParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { appsAtom, endpointsAtom } from "@frontend/utils/atoms";
import { IApp } from "@frontend/utils/types";
import StyledLink from "@frontend/components/dashboard/styledlink";
import AppTabs from "@frontend/components/apps/apptabs";

const items = [
  {
    title: "My Apps",
    href: "/apps",
  },
];

export default function App() {
  const appId = _.get(useParams(), "app");
  const apps: Array<IApp> = useAtomValue(appsAtom);
  const app = _.find(apps, { id: appId }) as IApp;
  const endpoints = useAtomValue(endpointsAtom);
  const breadCrumbItems = _.map(
    [
      ...items,
      { title: _.get(app, "name", ""), href: `/apps/${_.get(app, "id", "")}` },
    ],
    (item, index) => (
      <StyledLink link={_.get(item, "href")} key={index}>
        <Text>{_.get(item, "title").toUpperCase()}</Text>
      </StyledLink>
    ),
  );

  return (
    <DashboardLayout>
      <Stack gap={10}>
        <Breadcrumbs>{breadCrumbItems}</Breadcrumbs>
        <Title order={1} maw={700}>
          {_.get(app, "name")}
        </Title>
        <Tooltip.Floating
          label={_.get(app, "description")}
          position="right"
          multiline
          w={320}
          mt={20}
        >
          <Text c="dimmed" maw={600}>
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
