import { Tabs } from "@mantine/core";
import classes from "@frontend/styles/tabs.module.css";
import Insights, { UsageChart } from "../dashboard/insights";
import EndpointList from "./endpoints";
import AppRules from "./appRules";
import { useAtomValue } from "jotai";
import { ruleTypesAtom } from "@frontend/utils/atoms";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IRuleType } from "@frontend/utils/types";
import CreateAppRuleModal from "./appRuleModal";

const AppTabs: React.FC = () => {
  const ruleTypes = useAtomValue(ruleTypesAtom);
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  return (
    <Tabs
      color="orange"
      defaultValue={params?.get("i") ?? "insights"}
      classNames={classes}
      onChange={(value) => router.push(path + `?i=${value}`)}
    >
      <Tabs.List>
        <Tabs.Tab value="insights">Insights</Tabs.Tab>
        <Tabs.Tab value="endpoints">Endpoints</Tabs.Tab>
        <Tabs.Tab value="usage">Usage</Tabs.Tab>
        <Tabs.Tab value="rules">Rules</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="insights" py={20}>
        <Insights />
      </Tabs.Panel>
      <Tabs.Panel value="endpoints" py={20}>
        <EndpointList />
      </Tabs.Panel>
      <Tabs.Panel value="usage" py={20}>
        {/* <UsageChart width={"100%"} /> */}
        {/*  TODO: */}
        Usage chart to be updated for here
      </Tabs.Panel>
      <Tabs.Panel value="rules" pt={16}>
        {ruleTypes.map((rule: IRuleType) => (
          <AppRules rule={rule} key={rule.id} />
        ))}

        <CreateAppRuleModal />
      </Tabs.Panel>
    </Tabs>
  );
};

export default AppTabs;
