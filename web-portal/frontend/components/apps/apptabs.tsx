import { Tabs } from "@mantine/core";
import classes from "@frontend/styles/tabs.module.css";
import Insights from "../dashboard/insights";
import EndpointList from "./endpoints";

const AppTabs: React.FC = () => {
  return (
    <Tabs color="orange" defaultValue="Insights" classNames={classes}>
      <Tabs.List>
        <Tabs.Tab value="Insights">Insights</Tabs.Tab>
        <Tabs.Tab value="Endpoints">Endpoints</Tabs.Tab>
        <Tabs.Tab value="Usage">Usage</Tabs.Tab>
        <Tabs.Tab value="Rules">Rules</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Insights" p={20}>
        <Insights />
      </Tabs.Panel>
      <Tabs.Panel value="Endpoints">
        <EndpointList />
      </Tabs.Panel>
      <Tabs.Panel value="Usage">Usage tab content</Tabs.Panel>
      <Tabs.Panel value="Rules">Rules tab content</Tabs.Panel>
    </Tabs>
  );
};

export default AppTabs;
