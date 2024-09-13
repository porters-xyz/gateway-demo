import { useEffect, useState } from "react";
import {
    Flex,
    Stack,
    Button,
    TextInput,
    Text,
    Select,
    Loader,
} from "@mantine/core";
import _, { isNumber } from "lodash";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { IToken } from "@frontend/utils/types";
import { SearchableSelectModal } from "./SearchableSelectModal";
import { Address, erc20Abi } from "viem";
import { supportedChains } from "@frontend/utils/consts";

import { chains } from "@frontend/utils/Web3Provider";
import {
    useCheckAllowance,
    useQuote,
    useTokenBalance,
    useTokenList,
    useTokenPrice,
} from "@frontend/utils/hooks";
import { portrTokenData } from "@frontend/utils/consts";
import { useQueryClient } from "@tanstack/react-query";
import {
    useChainId,
    useSendTransaction,
    useSwitchChain,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { useForm } from "@mantine/form";
import { useSetAtom } from "jotai";
import { notificationAtom } from "@frontend/utils/atoms";

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

const chainOptions = _.map(chains, "name").filter((c) => !c.includes("Eth") && !c.includes('Gno'));

export default function Swap() {
    // Network/Token data
    const [selectedChainId, setSelectedChainId] = useState(10);
    const selectedChain = _.find(
        chains,
        (c) => Number(c.id) === Number(selectedChainId),
    );
    const { data: tokenList } = useTokenList({ chainId: selectedChainId });
    const defaultToken = _.first(tokenList) as IToken;

    console.log('selectedChainId', selectedChainId);
    console.log('supportedChains', supportedChains);

    const exchangeProxy = _.get(
        _.find(supportedChains, { id: selectedChainId.toString() }),
        "exchangeProxy",
    ) as unknown as Address;

    console.log('exchangeProxy', exchangeProxy);

    // Utils
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { writeContractAsync, isPending, isError, isSuccess } = useWriteContract();
    const { sendTransaction, data: sendTxData, isSuccess: isSubmitted } = useSendTransaction();
    const queryClient = useQueryClient();

    // UI States
    const setNotificationData = useSetAtom(notificationAtom);
    const [hash, setHash] = useState();
    const { data } = useWaitForTransactionReceipt({ hash: sendTxData })

    const [selectedTokenData, setSelectedTokenData] = useState<IToken>();

    const { values, getInputProps, setFieldValue } = useForm({
        validate: {
            sellAmount: (val) =>
                val < Number(_.get(selectedTokenBalance, "formatted", 0))
                    ? null
                    : "Not Enough Balance",
            buyAmount: (val: number) =>
                isNumber(val) && val > 0 ? null : `Invalid Quote`,
        },
        initialValues: {
            sellAmount: 0.0,
            buyAmount: 0.0,
        },
    });

    const { sellAmount, buyAmount } = values;

    const [opened, setOpened] = useState(false);

    // Data Fetching
    const { data: selectedTokenBalance } = useTokenBalance({
        token:
            selectedTokenData?.address === defaultToken?.address
                ? undefined
                : selectedTokenData?.address!,
        chainId: selectedChainId,
    });

    const { data: selectedTokenPrice } = useTokenPrice({
        token: selectedTokenData?.address!,
        chainId: selectedTokenData?.chainId!,
    });

    console.log('selectedTokenData', selectedTokenData);
    
    const {
        data: quote,
        isLoading: isQuoteLoading,
        isFetching: isQuoteFetching,
    } = useQuote({
        sellToken: selectedTokenData?.address!,
        chainId: selectedTokenData?.chainId!,
        sellAmount: Number(sellAmount * 10 ** selectedTokenData?.decimals!),
    });

    const { data: allowance } = useCheckAllowance({
        sellTokenAddress: selectedTokenData?.address!,
        selectedChainId,
        exchangeProxy,
    });

    // Helpers
    const showError =
        sellAmount > Number(_.get(selectedTokenBalance, "formatted", 0)) ||
        !selectedTokenBalance;

    const shouldDisable =
        isQuoteLoading ||
        isQuoteFetching ||
        !buyAmount ||
        !sellAmount ||
        showError ||
        !quote ||
        !selectedChain ||
        !selectedTokenData ||
        !selectedTokenBalance;

    const sellAmountBigNumber = Number.isNaN(sellAmount)
        ? BigInt(0)
        : BigInt(sellAmount * 10 ** (selectedTokenData?.decimals ?? 18));

    const needToSwitchChain = chainId !== selectedChainId;
    const needToApproveToken =
        allowance === BigInt(0) ||
        (allowance &&
            allowance <
            BigInt(sellAmount * 10 ** selectedTokenData?.decimals!));

    // Action Handlers
    const handleSwitchNetwork = () => {
        switchChain({ chainId: selectedChainId });
    };

    const handleTokenChange = (token: IToken) => {
        setSelectedTokenData(token);
        setFieldValue("sellAmount", 0.0);
        setFieldValue("buyAmount", 0.0);
    };

    useEffect(() => {
        queryClient.refetchQueries({ queryKey: ["0xPrice"] });
        queryClient.refetchQueries({ queryKey: ["0xQuote"] });
    }, [sellAmount]);

    const handleAllowance = async () => {
        console.log("Handling allowance with exchangeProxy:", exchangeProxy);
        
        const txHash = await writeContractAsync({
            chainId: selectedChainId,
            address: quote?.sellTokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [exchangeProxy, sellAmountBigNumber]
        });
        if (txHash) {
            setHash(txHash as any)
        }
    };

    const handleSwap = () => {
        console.log("Preparing to send transaction with the following details:");
        console.log("To (exchangeProxy):", quote?.to);
        console.log("Value:", quote?.value);
        console.log("Data:", quote?.data);

        sendTransaction({
            to: quote?.to!,
            value: quote?.value,
            data: quote?.data,
        });
    };




    // Effects

    useEffect(() => {
        if (isSubmitted || isSuccess) {
            setNotificationData({
                title: 'Your tx was submitted on chain',
                content: 'Please wait for it to be completed onchain!'
            })
        }

        if (data?.status == 'success') {
            setNotificationData({
                title: 'Your tx was successful',
                content: 'Please wait for UI to reflect changes.'
            })
        }

        if (data?.status == 'reverted') {
            setNotificationData({
                title: 'Your tx was not successful',
                content: 'Please check on block explorer or contact porters support!'
            })
        }

    }, [isSubmitted, data, isSubmitted, hash, sendTxData])

    useEffect(() => {
        if (!selectedTokenData) setSelectedTokenData(defaultToken);
    }, [defaultToken]);

    useEffect(() => {
        if (selectedTokenBalance?.value === BigInt(0)) {
            setFieldValue("sellAmount", 0.0);
            setFieldValue("buyAmount", 0.0);
        }
    }, [selectedTokenBalance]);

    useEffect(() => {
        setFieldValue(
            "buyAmount",
            quote?.buyAmount
                ? _.toNumber(quote?.buyAmount) / 10 ** portrTokenData?.decimals
                : 0.0,
        );
    }, [quote]);

    return (
        <Stack p={8} mt={10}>
            <SearchableSelectModal
                onClose={() => setOpened(false)}
                opened={opened}
                options={tokenList!}
                onSelect={(token: IToken) => {
                    handleTokenChange(token);
                    setOpened(false);
                }}
            />
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
                        label="Swap"
                        type="number"
                        {...getInputProps("sellAmount")}
                        styles={{
                            ...commonStyles,
                            input: { ...commonStyles.input, fill: "#fff" },
                            error: { marginLeft: 10 },
                        }}
                        error={showError ? "Not enough balance" : undefined}
                    />
                    <Stack>
                        <Button
                            style={{
                                fontFamily: karla.style.fontFamily,
                                borderRadius: 50,
                            }}
                            onClick={() => setOpened(true)}
                            bg={"blue"}
                        >
                            <Image
                                src={
                                    _.get(
                                        selectedTokenData,
                                        "logoURI",
                                    ) as string
                                }
                                alt={
                                    _.get(selectedTokenData, "symbol") as string
                                }
                                width={24}
                                height={24}
                                style={{ marginRight: 10, borderRadius: 50 }}
                            />
                            {_.get(selectedTokenData, "symbol") as string}
                        </Button>
                    </Stack>
                </Flex>
                <Flex justify="space-between" dir="row" mx={10}>
                    <Text
                        size="sm"
                        style={{ fontWeight: 600 }}
                        c={showError ? "red" : "green"}
                    >
                        {`$ `}
                        {(
                            Number(sellAmount ?? 0) *
                            Number(
                                _.get(
                                    selectedTokenPrice,
                                    [selectedTokenData?.address!],
                                    0,
                                ),
                            ) || 0.0
                        ).toFixed(6)}
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
                                    "sellAmount",
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
                    label="Get"
                    styles={{
                        ...commonStyles,
                        input: { ...commonStyles.input, fill: "#fff" },
                    }}
                    leftSection={
                        isQuoteLoading || isQuoteFetching ? (
                            <Loader size="sm" />
                        ) : null
                    }
                    {...getInputProps("buyAmount")}
                    readOnly
                />
                <Button
                    style={{
                        fontFamily: karla.style.fontFamily,
                        borderRadius: 50,
                        width: 160
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
                    PORTR
                </Button>
            </Flex>

            <Flex justify="space-between" dir="row" mx={10} mt={-10}>
                <Text
                    size="sm"
                    style={{ fontWeight: 600 }}
                    c='blue'
                >
                    {`Number of Relays ≈ `}
                    {Number(values["buyAmount"]) * 1000}
                </Text>
            </Flex>

            <Button
                size="lg"
                onClick={
                    needToSwitchChain
                        ? handleSwitchNetwork
                        : needToApproveToken
                            ? handleAllowance
                            : handleSwap
                }
                style={{
                    backgroundColor: 'carrot'
                }}
                disabled={shouldDisable && !needToSwitchChain}
                loading={isPending}
                loaderProps={{ type: 'dots' }}
            >
                {showError
                    ? "Not enough balance"
                    : needToSwitchChain
                        ? `Switch to ${selectedChain?.name!}`
                        : needToApproveToken
                            ? `Approve ${selectedTokenData?.name!}`
                            : "Swap"}
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
