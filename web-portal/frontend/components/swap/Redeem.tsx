import { useState } from "react";
import { Flex, Stack, Button, TextInput, Text, Select } from "@mantine/core";
import _ from "lodash";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { IToken } from "@frontend/utils/types";
import { SearchableSelectModal } from "./SearchableSelectModal";
import { portrTokenData } from "@frontend/utils/consts";
import { chains } from "@frontend/utils/Web3Provider";
import { useTokenBalance, useTokenList } from "@frontend/utils/hooks";
import { portrOPAddress } from "@frontend/utils/consts";

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

  const { data: selectedTokenBalance } = useTokenBalance({
    token: portrTokenData.address,
    chainId: portrTokenData?.chainId,
  });

  const [redeemValue, setRedeemValue] = useState(0);

  return (
    <Stack p={8} mt={10}>
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
            label="Redeem"
            type="number"
            value={redeemValue}
            onChange={(e) => setRedeemValue(parseFloat(e.target.value))}
            styles={{
              ...commonStyles,
              input: { ...commonStyles.input, fill: "#fff" },
              error: { marginLeft: 10 },
            }}
            error={
              redeemValue > Number(_.get(selectedTokenBalance, "formatted"))
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
              Number(_.get(selectedTokenBalance, "formatted") ?? 0).toFixed(6)}
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
                setRedeemValue(
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

      <Button size="lg">Redeem</Button>
    </Stack>
  );
}
