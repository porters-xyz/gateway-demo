import { Stack, Flex, Title, SegmentedControl, Card } from "@mantine/core";
import React from "react";
import classes from "@frontend/styles/insight.module.css";
import { AreaChart } from "@mantine/charts";
import { useRouter, useSearchParams } from "next/navigation";

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
    <Card shadow="none" padding="lg" radius="md" bg="#fff" w={400}>
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
      <Title
        w="full"
        h="100%"
        style={{
          textAlign: "center",
          fontSize: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        99.9%
      </Title>
    </Card>
  );
};

const Insights: React.FC = () => {
  // const [value, setValue] = useState(timeOptions[0]);
  const params = useSearchParams();
  const router = useRouter();
  return (
    <Stack>
      <Flex justify={"space-between"}>
        <Title order={3}>Insights</Title>
        <SegmentedControl
          bg="#fff"
          color="umbra.1"
          withItemsBorders={false}
          value={params.get("t") || timeOptions[0]}
          onChange={(value) => router.push("?t=" + value)}
          data={timeOptions.map((value) => ({ value, label: value }))}
        />
      </Flex>
      <Flex gap={8}>
        <Card shadow="none" padding="lg" radius="md" bg="#fff" w={400}>
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
        <Stack>
          <MetricCard title="Number of Requests" value="1.2K" />
          <MetricCard title="Balance" value="3.3M" />
        </Stack>
        <RingCard title="Requests" />
      </Flex>
    </Stack>
  );
};

export default Insights;
