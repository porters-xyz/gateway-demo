import DashboardLayout from "@frontend/components/dashboard/layout";
import { Stack, Tabs, rem } from "@mantine/core";
import { useState } from "react";
import { crimson } from "@frontend/utils/theme";
import Swap from "@frontend/components/swap/Swap";
import Redeem from "@frontend/components/swap/Redeem";
import classes from "@frontend/styles/tabs.module.css";

import _ from "lodash";

export default function SwapOrRedeem() {
  const [value, setValue] = useState("swap");

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

          <Tabs.Panel value="swap">
            <Swap />
          </Tabs.Panel>
          <Tabs.Panel value="redeem">
            <Redeem />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </DashboardLayout>
  );
}
