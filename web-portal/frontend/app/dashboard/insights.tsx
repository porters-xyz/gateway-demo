import {
  Stack,
  Flex,
  Title,
  Text,
  SegmentedControl,
  Card,
  Group,
} from "@mantine/core";
import React, { useState } from "react";
import classes from "./insight.module.css";
import { AreaChart } from "@mantine/charts";
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

const Insights: React.FC = () => {
  const [value, setValue] = useState(timeOptions[0]);

  return (
    <Stack>
      <Flex justify={"space-between"}>
        <Title order={3}>Insights</Title>
        <SegmentedControl
          bg="#fff"
          color="umbra.1"
          withItemsBorders={false}
          value={value}
          onChange={setValue}
          data={timeOptions.map((value) => ({ value, label: value }))}
        />
      </Flex>
      <Card shadow="none" padding="lg" radius="md" bg="#fff" w={500}>
        <Title order={3} fw={500}>
          Usage
        </Title>

        <AreaChart
          mt={20}
          h={300}
          data={data}
          dataKey="date"
          className={classes.root}
          strokeWidth={0.5}
          series={[{ name: "Apples", color: "var(--area-color)" }]}
        />
      </Card>
    </Stack>
  );
};

export default Insights;
