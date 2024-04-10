import { Card, Text, Stack, Switch, Pill, Flex } from "@mantine/core";
import { useParams, usePathname, useRouter } from "next/navigation";

import { IAppRule, IRuleType } from "@frontend/utils/types";
import _ from "lodash";
import { useAtomValue, useSetAtom } from "jotai";
import { appsAtom, existingRuleValuesAtom } from "@frontend/utils/atoms";

const AppRules: React.FC<{ rule: Partial<IRuleType> }> = ({ rule }) => {
  const path = usePathname();
  const { app } = useParams();
  const router = useRouter();
  const appData = useAtomValue(appsAtom);
  const setExistingRuleValues = useSetAtom(existingRuleValuesAtom);

  const ruleData = _.get(_.first(_.filter(appData, { id: app })), "appRules");
  const ruleCount = _.countBy(ruleData, "ruleId");

  const existingData = _.filter(ruleData, {
    ruleId: rule.id,
  }) as IAppRule[];

  const values = existingData?.map((item) => (
    <Pill
      key={item.ruleId}
      size="lg"
      m={2}
      bg={"blue"}
      style={{
        color: "white",
      }}
    >
      {item.value}
    </Pill>
  ));

  return (
    <Card
      withBorder
      style={{
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderRadius: 0,
        gap: 4,
      }}
    >
      <Flex justify={"space-between"}>
        <Stack gap={4}>
          <Text size="xl">{_.startCase(rule.name?.replace("-", " "))}</Text>
          <Text size="sm" opacity={0.5}>
            {rule.description}
          </Text>
        </Stack>
        <Switch
          onLabel="ON"
          offLabel="OFF"
          size="lg"
          checked={_.get(ruleCount, String(rule.id)) > 0}
          onChange={(value) => {
            if (value) {
              setExistingRuleValues(_.map(existingData, "value") as string[]);
              router.push(
                path +
                  `?i=rules&rule=${rule.name?.toLowerCase().replace(/ /g, "-")}`,
              );
            }
          }}
        />
      </Flex>
      {values?.length > 0 && rule.name != "secret-key" && (
        <Flex wrap={"wrap"} my={8}>
          {values}
        </Flex>
      )}
    </Card>
  );
};

export default AppRules;
