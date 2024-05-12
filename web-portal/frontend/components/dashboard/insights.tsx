import {
    Stack,
    Flex,
    Title,
    SegmentedControl,
    Card,
    RingProgress,
} from "@mantine/core";
import React from "react";
import classes from "@frontend/styles/insight.module.css";
import { AreaChart } from "@mantine/charts";
import numeral from "numeral";
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useAppUsage, useTenantUsage } from "@frontend/utils/hooks";
import _ from "lodash";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@frontend/utils/atoms";

const timeOptions = [
    {
        option: "1h",
        format: "HH:mm",
    },
    {
        option: "24h",
        format: "HH:mm",
    },
    {
        option: "7d",
        format: "MM/dd",
    },
    {
        option: "30d",
        format: "MM/dd",
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
            <Title
                w="full"
                h="full"
                style={{ textAlign: "right", fontSize: 80 }}
            >
                {value}
            </Title>
        </Card>
    );
};

const RingCard: React.FC<{
    title: string;
    successData: number;
    failureData: number;
}> = ({ title, successData, failureData }) => {
    const successRate = (successData * 100) / successData + failureData;
    const failureRate = 100 - successRate;
    return (
        <Card shadow="none" padding="lg" radius="md" bg="#fff" w={400}>
            <Title order={3} fw={500}>
                {title}
            </Title>
            <Stack align="center" justify="center" h="100%">
                {_.isNaN(successRate) ? (
                    <NoRequests />
                ) : (
                    <RingProgress
                        size={200}
                        sections={[
                            {
                                value: successRate,
                                color: "carrot",
                            },
                            {
                                value: failureRate,
                                color: "red",
                            },
                        ]}
                        rootColor="white"
                        label={
                            <Title
                                c="umbra.1"
                                fw={700}
                                ta="center"
                                order={_.isNaN(successRate) ? 4 : 2}
                            >
                                {successRate + `%`}
                            </Title>
                        }
                    />
                )}
            </Stack>
        </Card>
    );
};

const NoRequests = () => {
    return (
        <Stack h="100%" w="100%" justify="center" align="center" gap={2}>
            <Title order={1} c="umbra.1">
                😵
            </Title>
            <Title order={4} c="umbra.1">
                No usage data yet
            </Title>
        </Stack>
    );
};

export const UsageChart: React.FC<{
    width?: number | string;
    data: Array<{ time: string; requests: number }>;
    totalRequests: number;
}> = ({ width = 600, data, totalRequests }) => {
    console.log(data);
    return (
        <Card shadow="none" padding="lg" radius="md" bg="#fff" w={width}>
            <Title order={3} fw={500}>
                Usage
            </Title>

            {!totalRequests ? (
                <NoRequests />
            ) : (
                <AreaChart
                    mt={20}
                    h={275}
                    data={data}
                    dataKey="time"
                    className={classes.root}
                    strokeWidth={0.5}
                    series={[{ name: "requests", color: "var(--area-color)" }]}
                    withDots={false}
                />
            )}
        </Card>
    );
};
const Insights: React.FC = () => {
    const params = useSearchParams();
    const path = usePathname();
    const session = useAtomValue(sessionAtom);
    const tenantId = session?.tenantId;
    const balance = session?.netBalance[0];

    const router = useRouter();

    const timeOption = params?.get("t") ?? timeOptions[1].option;

    const { data: promData } = useAppUsage(timeOption);
    const { data: promUserData } = useTenantUsage(String(tenantId), timeOption);

    const chartData = path?.startsWith("/apps/")
        ? promData?.data?.result[0]?.values
        : promUserData?.data?.result[0]?.values;

    const readableChartData = _.map(chartData, ([timestamp, value]) => {
        return {
            time: format(
                timestamp * 1000,
                _.filter(timeOptions, { option: timeOption })[0].format,
            ),
            requests: value,
        };
    });

    const totalRequests =
        readableChartData.length > 1
            ? Math.abs(
                  _.toNumber(_.first(readableChartData)?.requests) -
                      _.toNumber(_.last(readableChartData)?.requests),
              )
            : _.toNumber(_.first(readableChartData)?.requests);

    const successData = totalRequests;
    const failureData = 0;

    return (
        <Stack>
            <Flex justify={"space-between"}>
                <Title order={3}>Insights</Title>
                <SegmentedControl
                    bg="#fff"
                    c="umbra"
                    withItemsBorders={false}
                    value={timeOption}
                    onChange={(value) => router.push(path + "?t=" + value)}
                    data={timeOptions.map((option) => ({
                        value: option.option,
                        label: option.option,
                    }))}
                />
            </Flex>
            <Flex gap={8}>
                <UsageChart
                    data={readableChartData}
                    totalRequests={totalRequests}
                />
                <Stack gap={8}>
                    <MetricCard
                        title={`Number of Requests (${timeOption})`}
                        value={String(totalRequests || 0)}
                    />
                    <MetricCard
                        title="Balance"
                        value={numeral(balance?.net).format("0.0a") || 0}
                    />
                </Stack>
                <RingCard
                    title="Success Rate"
                    successData={_.toNumber(successData)}
                    failureData={_.toNumber(failureData)}
                />
            </Flex>
        </Stack>
    );
};

export default Insights;
