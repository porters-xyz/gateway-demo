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
import { timeOptions } from "@frontend/utils/consts";


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
    data: Array<{ time: string | number; requests: number }>;
    totalRequests: number;
    appId?: string
    tenantId?: string
}> = ({ width = 600, data, totalRequests }) => {




    return (
        <Card shadow="none" padding="lg" radius="md" bg="#fff" w={width}>
            <Title order={3} fw={500}>
                Usage
            </Title>

            {totalRequests ?
                <AreaChart
                    mt={20}
                    h={275}
                    data={data}
                    dataKey="time"
                    className={classes.root}
                    strokeWidth={0.5}
                    series={[{ name: "requests", color: "var(--area-color)" }]}
                    withDots={false}
                /> : <NoRequests />}

        </Card>
    );
};
const Insights: React.FC = () => {
    const params = useSearchParams();
    const path = usePathname();
    const session = useAtomValue(sessionAtom);
    const balance = _.get(_.first(_.get(session, 'netBalance')), 'net', 0)



    const router = useRouter();

    const timeOption = params?.get("t") || timeOptions[1].option;

    const { data: appUsageData } = useAppUsage();
    const { data: tenantUsageData } = useTenantUsage();

    const chartData = path?.startsWith("/apps/")
        ? appUsageData
        : tenantUsageData



    const readableChartData = _.find(chartData, ({ period }) => _.toLower(period.toString()) === _.toLower(timeOption));

    const formattedData = _.map(readableChartData?.data, ([time, requests]) => ({
        time: format(
            time * 1000,
            _.filter(timeOptions, { option: timeOption })[0].format,
        ),
        requests: Number(requests)
    }));


    const totalRequests =
        Math.abs(
            _.get(_.first(formattedData), 'requests', 0) -
            _.get(_.last(formattedData), 'requests', 0),
        )


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
                    data={formattedData}
                    totalRequests={totalRequests}
                />
                <Stack gap={8}>
                    <MetricCard
                        title={`Total Requests (${timeOption})`}
                        value={String(totalRequests || 0)}
                    />
                    <MetricCard
                        title="Balance"
                        value={numeral(balance).format("0.0a") || 0}
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
