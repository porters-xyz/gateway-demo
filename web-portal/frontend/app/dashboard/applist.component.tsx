import React from "react";
import { Card, Text, Badge, Group, Stack } from "@mantine/core";
import { IApp } from "@frontend/utils/types";

export const AppList: React.FC<{ list: Array<IApp> }> = ({ list }) => (
  <Stack>
    {list.map((app: IApp) => (
      <AppCard key={app.id} app={app} />
    ))}
  </Stack>
);

const AppCard: React.FC<{ app: IApp }> = ({ app }) => (
  <Card padding="lg" radius="md" withBorder>
    <Group justify="flex-start" mb="xs" gap={8}>
      <Text fw={500}>AppId: {app.id}</Text>
      <Badge color="green">{app.active ? "Active" : "Not Active"}</Badge>
    </Group>
    <Text size="sm">Created At: {app.createdAt}</Text>
  </Card>
);

export default AppList;
