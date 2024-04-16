import { useState } from "react";
import { Flex, Stack, Button, TextInput } from "@mantine/core";
import { useAtomValue } from "jotai";
import _ from "lodash";
import Image from "next/image";
import { karla } from "@frontend/utils/theme";
import { tokenDataAtom } from "@frontend/utils/atoms";
import { IToken } from "@frontend/utils/types";
import { SearchableSelectModal } from "./SearchableSelectModal";

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

export default function Swap({ defaultToken }: { defaultToken: IToken }) {
  const tokenData = useAtomValue(tokenDataAtom);
  const [swapValue, setSwapValue] = useState(0);

  const [selectedTokenData, setSelectedTokenData] =
    useState<IToken>(defaultToken);

  const handleTokenChange = (token: IToken) => {
    setSelectedTokenData(token);
  };

  const [opened, setOpened] = useState(false);

  return (
    <Stack p={8}>
      <SearchableSelectModal
        onClose={() => setOpened(false)}
        opened={opened}
        options={tokenData}
        onSelect={(token: IToken) => {
          handleTokenChange(token);
          setOpened(false);
        }}
      />
      <Flex
        style={{
          mt: 20,
          bg: "white",
          borderRadius: 10,
          alignItems: "flex-end",
          justifyContent: "space-between",
          p: 8,
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
          }}
        />
        <Button
          style={{ fontFamily: karla.style.fontFamily, borderRadius: 50 }}
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
      </Flex>

      <Flex
        style={{
          bg: "white",
          borderRadius: 10,
          alignItems: "flex-end",
          justifyContent: "space-between",
          p: 8,
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
