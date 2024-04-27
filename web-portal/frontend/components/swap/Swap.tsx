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
import _ from "lodash";
import Image from "next/image";
import { crimson, karla } from "@frontend/utils/theme";
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
  useWriteContract,
} from "wagmi";

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

const chainOptions = _.map(chains, "name").filter((c) => !c.includes("Eth"));

export default function Swap() {
  // Network/Token data
  const [selectedChainId, setSelectedChainId] = useState(10);
  const selectedChain = _.find(
    chains,
    (c) => Number(c.id) === Number(selectedChainId),
  );
  const { data: tokenList } = useTokenList({ chainId: selectedChainId });
  const defaultToken = _.first(tokenList) as IToken;

  const exchangeProxy = _.get(
    _.find(supportedChains, { id: selectedChainId }),
    "exchangeProxy",
  ) as unknown as Address;

  // Utils
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  // UI States
  const [selectedTokenData, setSelectedTokenData] = useState<IToken>();
  const [sellAmount, setSellAmount] = useState(0.0);
  const [buyAmount, setBuyAmount] = useState(0.0);
  const [opened, setOpened] = useState(false);

  // Data Fetching
  const { data: selectedTokenBalance } = useTokenBalance({
    token:
      selectedTokenData?.address === defaultToken?.address
        ? undefined
        : selectedTokenData?.address!,
    chainId: selectedTokenData?.chainId!,
  });

  const { data: selectedTokenPrice } = useTokenPrice({
    token: selectedTokenData?.address!,
    chainId: selectedTokenData?.chainId!,
  });

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
    sellAmount > Number(_.get(selectedTokenBalance, "formatted")) ||
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
      allowance < BigInt(sellAmount * 10 ** selectedTokenData?.decimals!));

  // Action Handlers
  const handleSwitchNetwork = () => {
    if (chainId !== quote?.chainId) {
      switchChain({ chainId: quote?.chainId });
    }
  };

  const handleTokenChange = (token: IToken) => {
    setSelectedTokenData(token);
    setSellAmount(0.0);
    setBuyAmount(0.0);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSellAmount(Number(e.target.value));
    queryClient.refetchQueries({ queryKey: ["0xPrice"] });
    queryClient.refetchQueries({ queryKey: ["0xQuote"] });
  };

  const handleAllowance = () => {
    writeContract({
      chainId: selectedChainId,
      address: quote?.sellTokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [exchangeProxy, sellAmountBigNumber],
    });
  };

  const handleSwap = () => {
    sendTransaction({
      to: quote?.to!,
      value: quote?.value,
      data: quote?.data,
    });
  };

  // Effects

  useEffect(() => {
    if (!selectedTokenData) setSelectedTokenData(defaultToken);
  }, [defaultToken]);

  useEffect(() => {
    if (selectedTokenBalance?.value === BigInt(0)) {
      setBuyAmount(0.0);
    }
  }, [selectedTokenBalance]);

  useEffect(
    () =>
      setBuyAmount(Number(quote?.buyAmount) / 10 ** portrTokenData?.decimals),
    [quote],
  );

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
        defaultValue={_.get(_.find(chains, { id: selectedChainId }), "name")}
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
            value={sellAmount}
            onChange={(e) => handleSellAmountChange(e)}
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
                src={_.get(selectedTokenData, "logoURI") as string}
                alt={_.get(selectedTokenData, "symbol") as string}
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
                  _.get(selectedTokenPrice, [selectedTokenData?.address!], 0),
                ) || 0.0
            ).toFixed(6)}
          </Text>

          <Flex align={"center"} gap={4}>
            <Text size="sm">
              {Number(_.get(selectedTokenBalance, "formatted") ?? 0).toFixed(6)}
            </Text>

            <Text
              c="blue"
              size="sm"
              style={{ fontWeight: "bold", cursor: "pointer" }}
              onClick={() =>
                setSellAmount(
                  _.get(selectedTokenBalance, "formatted", 0) as number,
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
          value={
            !isQuoteLoading && !isQuoteFetching && buyAmount ? buyAmount : ""
          }
          leftSection={
            isQuoteLoading || isQuoteFetching ? <Loader size="sm" /> : null
          }
          onChange={(e) => setBuyAmount(parseFloat(e.target.value))}
          readOnly
        />
        <Button
          style={{
            fontFamily: karla.style.fontFamily,
            borderRadius: 50,
          }}
          bg={"blue"}
        >
          <Image
            src="/favicon.ico"
            alt="PORTR"
            width={24}
            height={24}
            style={{ marginRight: 10, borderRadius: 50 }}
          />
          PORTR
        </Button>
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
        bg={needToSwitchChain || showError ? "red" : "carrot"}
        disabled={shouldDisable}
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
          You will need to sign-in again, <br /> if you need to switch networks.
        </Text>
      )}
    </Stack>
  );
}
