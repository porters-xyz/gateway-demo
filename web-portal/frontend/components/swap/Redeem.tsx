import { useEffect, useState } from "react";
import { Flex, Stack, Button, TextInput, Text, Select, rem, Notification } from "@mantine/core";
import _, { isNumber, isString } from "lodash";
import { useWaitForTransactionReceipt } from "wagmi";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { useForm } from "@mantine/form";
import { portrTokenData } from "@frontend/utils/consts";
import { chains } from "@frontend/utils/Web3Provider";
import { useTokenBalance } from "@frontend/utils/hooks";
import { useChainId, useWriteContract, useSwitchChain } from "wagmi";
import { toHex, zeroAddress } from "viem";

import { abi } from "@frontend/utils/abi";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { notificationAtom, sessionAtom } from "@frontend/utils/atoms";

// Common styles for TextInput and Select components
const commonStyles = {
    input: {
        outline: "none",
        border: "none",
        background: "none",
        fontSize: 24,
    },
    label: {
        color: "#000",
        marginLeft: 10,
    },
};

const chainOptions = _.map(chains, "name").filter(
    (c) => !c.includes("Ethereum"),
);

export default function Redeem() {
    const session = useAtomValue(sessionAtom)
    const balance = _.get(_.first(_.get(session, 'netBalance')), 'net', 0)
    const [selectedChainId, setSelectedChainId] = useState(10);


    const selectedChain = _.find(
        chains,
        (c) => Number(c.id) === Number(selectedChainId),
    );

    const { writeContractAsync, isSuccess: isSubmitted } = useWriteContract();

    const [hash, setHash] = useState();

    const { data, isLoading } = useWaitForTransactionReceipt({ hash })

    const setNotificationData = useSetAtom(notificationAtom)

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const { data: selectedTokenBalance } = useTokenBalance({
        token: portrTokenData.address,
        chainId: selectedChainId,
    });

    const { values, getInputProps, setFieldValue } = useForm({
        validate: {
            accountId: (val) => isString(val),
            redeemValue: (val: number) =>
                val > Number(_.get(selectedTokenBalance, "formatted", 0)),
        },
        initialValues: {
            accountId: _.get(session, 'tenantId'),
            redeemValue: 0,
        },
    });

    const { redeemValue, accountId } = values;

    const shouldDisable =
        !redeemValue ||
        !(Number(_.get(selectedTokenBalance, "formatted", 0)) > 0) ||
        !accountId;
    const needToSwitchChain = chainId !== selectedChainId;

    const handleSwitchNetwork = () => {
        switchChain({ chainId: selectedChainId });
    };

    const hexAccountId = accountId
        ? toHex(accountId, {
            size: 32,
        })
        : zeroAddress;
    const bigNumberRedeem = BigInt(
        redeemValue * 10 ** portrTokenData?.decimals,
    );

    const handleRedeem = async () => {
        console.log("Attempting to redeem...");
        const txHash = await writeContractAsync({
            abi,
            chainId: selectedChainId,
            address: portrTokenData?.address,
            functionName: "applyToAccount",
            args: [hexAccountId, bigNumberRedeem],
        });
        if (txHash) {
            setHash(txHash as any)
        }
        console.log("Redeem Attempt was made: hash", { txHash });
    };


    useEffect(() => {
        if (isSubmitted) {
            setNotificationData({
                title: 'Your tx to top-up was submitted',
                content: 'Please wait for it to be completed onchain!'
            })
        }


        if (data?.status == 'success') {
            setNotificationData({
                title: 'Your tx was successful',
                content: 'Please wait for UI to reflect changes. and update your balance!'
            })
        }

        if (data?.status == 'reverted') {
            setNotificationData({
                title: 'Your tx was not successful',
                content: 'Please check on block explorer or contact porters support!'
            })
        }

    }, [isSubmitted, data])





    return (
        <Stack p={8} mt={10}>
            <Select
                data={chainOptions}
                defaultValue={_.get(
                    _.find(chains, { id: selectedChainId }),
                    "name",
                )}
                onChange={(val) => {
                    const selectedChain = _.find(
                        chains,
                        (c) => _.toLower(c.name) === _.toLower(val as string),
                    );
                    setSelectedChainId(selectedChain?.id as number);
                }}
                label="Select Network"
            />

            <Stack gap={4}>
                <Flex
                    style={{
                        bg: "white",
                        borderRadius: 10,
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        border: "1px solid #00000010",
                        padding: 8,
                        backgroundColor: "#F6EEE6",
                    }}
                >
                    <TextInput
                        placeholder="Enter amount"
                        label="Redeem"
                        type="number"
                        {...getInputProps("redeemValue")}
                        styles={{
                            ...commonStyles,
                            input: { ...commonStyles.input, fill: "#fff" },
                            error: { marginLeft: 10 },
                        }}
                        error={
                            redeemValue >
                                Number(_.get(selectedTokenBalance, "formatted", 0))
                                ? "Not enough balance"
                                : undefined
                        }
                    />
                    <Stack>
                        <Button
                            style={{
                                fontFamily: karla.style.fontFamily,
                                borderRadius: 50,
                            }}
                            bg={"blue"}
                        >
                            <Image
                                src={_.get(portrTokenData, "logoURI") as string}
                                alt={_.get(portrTokenData, "symbol") as string}
                                width={24}
                                height={24}
                                style={{ marginRight: 10, borderRadius: 50 }}
                            />
                            {_.get(portrTokenData, "symbol") as string}
                        </Button>
                    </Stack>
                </Flex>
                <Flex justify="space-between" dir="row" mx={10}>
                    <Text
                        size="sm"
                        style={{ fontWeight: 600 }}
                        c='blue'
                    >
                        Number of Relays ≈ {redeemValue * 1000}
                    </Text>
                    <Flex align={"center"} gap={4}>
                        <Text size="sm">
                            {Number(
                                _.get(selectedTokenBalance, "formatted", 0),
                            ).toFixed(6)}
                        </Text>

                        <Text
                            c="blue"
                            size="sm"
                            style={{ fontWeight: "bold", cursor: "pointer" }}
                            onClick={() =>
                                setFieldValue(
                                    "redeemValue",
                                    Number(
                                        _.get(
                                            selectedTokenBalance,
                                            "formatted",
                                            0,
                                        ),
                                    ),
                                )
                            }
                        >
                            max
                        </Text>
                    </Flex>
                </Flex>
            </Stack>
            <Flex
                style={{
                    bg: "white",
                    borderRadius: 10,
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    border: "1px solid #00000010",
                    padding: 8,
                    backgroundColor: "#F6EEE6",
                }}
            >
                <TextInput
                    label="Your Account ID"
                    styles={{
                        ...commonStyles,
                        input: { ...commonStyles.input, fill: "#fff" },
                    }}
                    {...getInputProps("accountId")}
                />
            </Flex>
            <Flex
                style={{
                    bg: "white",
                    borderRadius: 10,
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    border: "1px solid #00000010",
                    padding: 8,
                    backgroundColor: "#F6EEE6",
                }}
            >
                <TextInput
                    label={
                        redeemValue ? "New Balance" : "Current Balance"}
                    styles={{
                        ...commonStyles,
                        input: { ...commonStyles.input, fill: "#fff" },
                    }}
                    value={
                        Number(balance / 1000) + Number(redeemValue * 10 ** 3)}
                    readOnly
                />
            </Flex>

            <Button
                size="lg"
                style={{
                    backgroundColor: 'carrot'
                }}
                disabled={shouldDisable && !needToSwitchChain}
                onClick={needToSwitchChain ? handleSwitchNetwork : handleRedeem}
                loading={isLoading}
                loaderProps={{ type: 'dots' }}
            >
                {!needToSwitchChain
                    ? `Redeem`
                    : `Switch to ${selectedChain?.name}`}
            </Button>

            {needToSwitchChain && (
                <Text style={{ textAlign: "center", color: "red" }}>
                    You will need to sign-in again, <br /> if you need to switch
                    networks.
                </Text>
            )}
        </Stack>
    );
}
