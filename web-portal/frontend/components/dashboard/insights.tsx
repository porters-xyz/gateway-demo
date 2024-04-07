import {
  Stack,
  Flex,
  Title,
  SegmentedControl,
  Card,
  RingProgress,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import classes from "@frontend/styles/insight.module.css";
import { AreaChart } from "@mantine/charts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const timeOptions = ["24h", "7d", "30d", "All"];

export const data = [
  {
    date: "Mar 22",
    Apples: 2890,
    Oranges: 2338,
    Tomatoes: 2452,
  },
  {
    date: "Mar 23",
    Apples: 2756,
    Oranges: 2103,
    Tomatoes: 2402,
  },
  {
    date: "Mar 24",
    Apples: 3322,
    Oranges: 986,
    Tomatoes: 1821,
  },
  {
    date: "Mar 25",
    Apples: 3470,
    Oranges: 2108,
    Tomatoes: 2809,
  },
  {
    date: "Mar 26",
    Apples: 3129,
    Oranges: 1726,
    Tomatoes: 2290,
  },
];

const MetricCard: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => {
  return (
    <Card shadow="none" padding="lg" radius="md" bg="#fff" w={400} h="100%">
      <Title order={3} fw={500}>
        {title}
      </Title>
      <Title w="full" h="full" style={{ textAlign: "right", fontSize: 80 }}>
        {value}
      </Title>
    </Card>
  );
};

const RingCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card shadow="none" padding="lg" radius="md" bg="#fff" w={400}>
      <Title order={3} fw={500}>
        {title}
      </Title>
      <Stack align="center" justify="center" h="100%">
        <RingProgress
          size={200}
          sections={[
            { value: 99.99, color: "carrot.9" },
            { value: 0.01, color: "carrot.1" },
          ]}
          label={
            <Title c="umbra.1" fw={700} ta="center" order={2}>
              99.99%
            </Title>
          }
        />
      </Stack>
    </Card>
  );
};

export const UsageChart: React.FC<{
  width?: number | string;
}> = ({ width = 600 }) => {
  return (
    <Card shadow="none" padding="lg" radius="md" bg="#fff" w={width}>
      <Title order={3} fw={500}>
        Usage
      </Title>

      <AreaChart
        mt={20}
        h={275}
        data={data}
        dataKey="date"
        className={classes.root}
        strokeWidth={0.5}
        series={[{ name: "Apples", color: "var(--area-color)" }]}
      />
    </Card>
  );
};
const Insights: React.FC = () => {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  return (
    <Stack>
      <Flex justify={"space-between"}>
        <Title order={3}>Insights</Title>
        <SegmentedControl
          bg="#fff"
          c="umbra"
          withItemsBorders={false}
          value={params?.get("t") || timeOptions[0]}
          onChange={(value) => router.push(path + "?t=" + value)}
          data={timeOptions.map((value) => ({ value, label: value }))}
        />
      </Flex>
      <Flex gap={8}>
        <UsageChart />
        <Stack gap={8}>
          <MetricCard title="Number of Requests" value="1.2K" />
          <MetricCard title="Balance" value="3.3M" />
        </Stack>
        <RingCard title="Requests" />
      </Flex>
    </Stack>
  );
};

export default Insights;
