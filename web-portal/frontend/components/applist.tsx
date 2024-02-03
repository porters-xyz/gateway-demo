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
  <Card shadow="xs" padding="lg" radius="md" withBorder>
    <Group justify="flex-start" mb="xs" gap={8}>
      <Text fw={500}>{app.name}</Text>
      <Badge color="green">{app.status}</Badge>
    </Group>
    <Text size="sm" color="dimmed">
      Created At: {app.createdAt}
    </Text>
  </Card>
);

export default AppList;
