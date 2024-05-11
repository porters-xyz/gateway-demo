import _ from "lodash";
import { useAtom, useAtomValue } from "jotai";
import { existingRuleValuesAtom, ruleTypesAtom } from "@frontend/utils/atoms";
import { useForm, matches } from "@mantine/form";
import { Button, Flex, TextInput, Pill, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { IRuleType } from "@frontend/utils/types";

import { useUpdateRuleMutation } from "@frontend/utils/hooks";
import { useSearchParams, useParams, useRouter } from "next/navigation";

export default function AllowedUserAgentsForm() {
  const appId = useParams()?.app as string;
  const searchParams = useSearchParams();
  const rule = searchParams?.get("rule") as string;
  const { mutateAsync, isPending, isSuccess } = useUpdateRuleMutation(
    appId,
    rule,
  );
  const [value, setValue] = useAtom(existingRuleValuesAtom);
  const ruleTypes = useAtomValue(ruleTypesAtom);

  const validationRule = _.get(
    _.find(ruleTypes, (r: IRuleType) => r.name === rule),
    "validationValue",
  );
  const ruleRegex = new RegExp(validationRule as string);
  const form = useForm({
    validate: {
      userAgent: matches(ruleRegex, "Enter a valid url user agent string"),
    },
    initialValues: {
      userAgent: "",
    },
  });

  const handleValueRemove = (val: string) =>
    setValue((current: any) => current.filter((v: any) => v !== val));

  const formValidation = () => form.validate();

  const values = value.map((item) => (
    <Pill
      key={item}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}
      size="lg"
      m={2}
      bg={"blue"}
      style={{
        color: "white",
      }}
    >
      {item}
    </Pill>
  ));

  return (
    <Stack>
      <Flex dir="row" align="flex-end" gap={4}>
        <TextInput
          label="Allowed UserAgents"
          placeholder="Enter a valid user agent"
          inputWrapperOrder={["label", "input", "description"]}
          style={{ width: "100%" }}
          {...form.getInputProps("userAgent")}
        />
        <Button
          h={36}
          onClick={() => {
            if (formValidation().hasErrors) return;
            setValue((current: any) => [form.values.userAgent, ...current]),
              form.reset();
          }}
        >
          <IconPlus />
        </Button>
      </Flex>
      <Text c="red.6" size="xs">
        {form.errors.userAgent}
      </Text>
      <Flex wrap={"wrap"}>{values}</Flex>

      <Button
        fullWidth
        mt={32}
        onClick={() => mutateAsync(value)}
        loading={isPending && !isSuccess}
      >
        Update Allowed User Agents
      </Button>
    </Stack>
  );
}
