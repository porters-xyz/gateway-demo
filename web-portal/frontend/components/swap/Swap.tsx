import { useState } from "react";
import { Flex, Stack, Button, TextInput, Text, Select } from "@mantine/core";
import _ from "lodash";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { IToken } from "@frontend/utils/types";
import { SearchableSelectModal } from "./SearchableSelectModal";

import { chains } from "@frontend/utils/Web3Provider";
import {
  useQuote,
  useTokenBalance,
  useTokenList,
  useTokenPrice,
} from "@frontend/utils/hooks";

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

export default function Swap() {
  const [selectedChainId, setSelectedChainId] = useState(10);
  const { data: tokenList } = useTokenList({ chainId: selectedChainId });

  const defaultToken: IToken = _.filter(
    tokenList,
    (c: IToken) => c.address === `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
  )[0];

  const [selectedTokenData, setSelectedTokenData] =
    useState<IToken>(defaultToken);

  const handleTokenChange = (token: IToken) => {
    setSelectedTokenData(token);
  };

  const [opened, setOpened] = useState(false);

  const filteredTokenData = _.filter(
    tokenList,
    (t) => t.chainId === selectedChainId,
  );

  const { data: selectedTokenBalance } = useTokenBalance({
    token: selectedTokenData?.address,
    chainId: selectedTokenData?.chainId,
  });

  const { data: selectedTokenPrice } = useTokenPrice({
    token: selectedTokenData?.address,
    chainId: selectedTokenData?.chainId,
  });

  const [swapValue, setSwapValue] = useState(0);

  const { data: quote } = useQuote({
    sellToken: selectedTokenData?.address,
    chainId: selectedTokenData?.chainId,
    amount: String(swapValue * 10 ** selectedTokenData?.decimals),
  });

  return (
    <Stack p={8} mt={10}>
      <SearchableSelectModal
        onClose={() => setOpened(false)}
        opened={opened}
        options={filteredTokenData}
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
            value={swapValue}
            onChange={(e) => setSwapValue(parseFloat(e.target.value))}
            styles={{
              ...commonStyles,
              input: { ...commonStyles.input, fill: "#fff" },
              error: { marginLeft: 10 },
            }}
            error={
              swapValue > Number(_.get(selectedTokenBalance, "formatted"))
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
          <Text size="sm">
            $
            {(
              Number(swapValue ?? 0) *
                Number(
                  _.get(selectedTokenPrice, [selectedTokenData?.address], 0),
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
                setSwapValue(
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

      <Button size="lg">Swap</Button>
    </Stack>
  );
}
