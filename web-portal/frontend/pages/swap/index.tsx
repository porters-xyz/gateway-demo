import DashboardLayout from "@frontend/components/dashboard/layout";
import { Stack, Tabs, rem } from "@mantine/core";
import { useEffect, useState } from "react";
import { crimson } from "@frontend/utils/theme";
import Swap from "@frontend/components/swap/Swap";
import Redeem from "@frontend/components/swap/Redeem";
import classes from "@frontend/styles/tabs.module.css";
import { IToken } from "@frontend/utils/types";
import { useSetAtom } from "jotai";
import { tokenDataAtom } from "@frontend/utils/atoms";
import _ from "lodash";

export default function SwapOrRedeem({
  data,
  defaultToken,
}: {
  data: IToken[];
  defaultToken: IToken;
}) {
  const [value, setValue] = useState("swap");
  const setTokenData = useSetAtom(tokenDataAtom);

  useEffect(() => {
    setTokenData(data);
  });

  return (
    <DashboardLayout>
      <Stack
        style={{
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: rem(20),
        }}
      >
        <Tabs
          color="orange"
          miw={400}
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
          }}
          defaultValue={value}
          classNames={classes}
          p={10}
          onChange={() => setValue(value === "swap" ? "redeem" : "swap")}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value="swap"
              styles={{
                tabLabel: {
                  fontSize: 20,
                  fontFamily: crimson.style.fontFamily,
                },
              }}
            >
              Swap
            </Tabs.Tab>
            <Tabs.Tab
              value="redeem"
              styles={{
                tabLabel: {
                  fontSize: 20,
                  fontFamily: crimson.style.fontFamily,
                },
              }}
            >
              Redeem
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="swap" pt={20}>
            <Swap defaultToken={defaultToken} />
          </Tabs.Panel>
          <Tabs.Panel value="redeem">
            <Redeem />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  const res = await fetch("https://static.optimism.io/optimism.tokenlist.json");
  const data = await res.json();

  const { tokens } = data;
  const filteredTokens = _.filter(tokens, (token) => {
    return token.chainId === 10 || token.chainId === 8453;
  });
  const defaultToken = _.filter(tokens, { name: "USD Coin" })[0];
  return {
    props: {
      data: filteredTokens satisfies IToken[],
      defaultToken: defaultToken satisfies IToken,
    },
  };
}
