import { useState } from "react";
import { Flex, Stack, Button, TextInput, Text, Select } from "@mantine/core";
import _, { isNumber, isString } from "lodash";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { useForm } from "@mantine/form";
import { portrTokenData } from "@frontend/utils/consts";
import { chains } from "@frontend/utils/Web3Provider";
import { useTokenBalance } from "@frontend/utils/hooks";
import { useChainId, useWriteContract, useSwitchChain } from "wagmi";
import { toHex, zeroAddress } from "viem";

import { abi } from "@frontend/utils/abi";

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
    const [selectedChainId, setSelectedChainId] = useState(10);
    const selectedChain = _.find(
        chains,
        (c) => Number(c.id) === Number(selectedChainId),
    );

    const { writeContractAsync } = useWriteContract();

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const { data: selectedTokenBalance } = useTokenBalance({
        token: portrTokenData.address,
        chainId: portrTokenData?.chainId,
    });

    const { values, getInputProps, setFieldValue } = useForm({
        validate: {
            accountId: (val) => isString(val),
            redeemValue: (val: number) =>
                val > Number(_.get(selectedTokenBalance, "formatted", 0)),
        },
        initialValues: {
            accountId: "",
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
        redeemValue * 10 ** portrTokenData?.decimals ?? 0,
    );

    const handleRedeem = async () => {
        console.log("Attempting to redeem...");
        await writeContractAsync({
            abi,
            chainId: selectedChainId,
            address: portrTokenData?.address,
            functionName: "applyToAccount",
            args: [hexAccountId, bigNumberRedeem],
        });

        console.log("Attempt was made");
    };

    console.log({
        handleRedeem,
        writeContractAsync,
        hexAccountId,
        bigNumberRedeem,
    });

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
                    <Text size="sm">
                        {`$` +
                            (isNaN(redeemValue) ? 0 : redeemValue * 5).toFixed(
                                6,
                            )}
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
                    paddingLeft: 8,
                    paddingTop: 8,
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
                    label="New Balance"
                    styles={{
                        ...commonStyles,
                        input: { ...commonStyles.input, fill: "#fff" },
                    }}
                    readOnly
                />
            </Flex>

            <Button
                size="lg"
                c="white"
                bg={shouldDisable || needToSwitchChain ? "red" : "carrot"}
                disabled={shouldDisable}
                onClick={needToSwitchChain ? handleSwitchNetwork : handleRedeem}
            >
                {!needToSwitchChain
                    ? `Redeem`
                    : `Swtich to ${selectedChain?.name}`}
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
