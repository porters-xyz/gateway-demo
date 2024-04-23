import { Button, Flex, TextInput, Pill, Stack, Text } from "@mantine/core";
import _ from "lodash";
import { useForm, matches } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useUpdateRuleMutation } from "@frontend/utils/hooks";
import { useParams, useSearchParams } from "next/navigation";
import { useAtom, useAtomValue } from "jotai";
import { existingRuleValuesAtom, ruleTypesAtom } from "@frontend/utils/atoms";
import { IRuleType } from "@frontend/utils/types";

export default function AllowedOriginsForm() {
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
      url: matches(
        ruleRegex,
        "Enter a valid url that starts with http or https",
      ),
    },
    initialValues: {
      url: "",
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
          label="Allowed Origin"
          placeholder="Enter a valid Url"
          type="url"
          inputWrapperOrder={["label", "input", "description"]}
          style={{ width: "100%" }}
          {...form.getInputProps("url")}
        />
        <Button
          h={36}
          onClick={() => {
            if (formValidation().hasErrors) return;
            setValue((current: any) => [form.values.url, ...current]),
              form.reset();
          }}
        >
          <IconPlus />
        </Button>
      </Flex>
      <Text c="red.6" size="xs">
        {form.errors.url}
      </Text>
      <Flex wrap={"wrap"}>{values}</Flex>

      <Button
        fullWidth
        style={{ marginTop: 32 }}
        onClick={() => mutateAsync(value)}
        loading={isPending && !isSuccess}
      >
        Update Allowed Origins
      </Button>
    </Stack>
  );
}
