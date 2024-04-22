import _ from "lodash";
import { useAtom, useAtomValue } from "jotai";
import { existingRuleValuesAtom, ruleTypesAtom } from "@frontend/utils/atoms";
import { useForm } from "@mantine/form";
import {
  Button,
  Flex,
  Pill,
  Stack,
  Text,
  Select,
  NumberInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { IRuleType } from "@frontend/utils/types";

import { useUpdateRuleMutation } from "@frontend/utils/hooks";
import { useSearchParams, useParams } from "next/navigation";

const periodOptions = [
  { label: "Weekly", value: "P1W" },
  { label: "Monthly", value: "P1M" },
  { label: "Daily", value: "P1D" },
];

export default function RateLimitForm() {
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
      requests: (val) => {
        return _.isInteger(Number(val)) && Number(val) > 0
          ? null
          : "Please enter a valid number";
      },
      period: (val: string) => {
        const isValid = periodOptions.some((option) => {
          return option.value === val;
        });

        const alreadyExists = value.some((v) => v.includes(val));
        if (alreadyExists) {
          return "Period already exists";
        }
        return isValid ? null : "Please select a valid period";
      },
    },
    initialValues: {
      requests: "",
      period: "",
    },
  });

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  const formValidation = () => form.validate();

  const values = value?.map((val) => (
    <Pill
      key={val}
      withRemoveButton
      onRemove={() => handleValueRemove(val)}
      size="lg"
      m={2}
      bg="blue"
      style={{
        color: "white",
      }}
    >
      {val
        ?.replace("P1D", "Daily")
        .replace("P1W", "Weekly")
        .replace("P1M", "Monthly")}
    </Pill>
  ));

  const handleSubmit = () => {
    const isValid = value.map((v) => (ruleRegex.test(v) ? true : false));
    isValid.includes(false)
      ? form.setErrors({ requests: "Invalid value" })
      : mutateAsync(value);
  };

  return (
    <Stack>
      <Flex dir="row" align="flex-end" gap={4}>
        <NumberInput
          label="Allowed # of Requests"
          placeholder="Enter a valid number"
          inputWrapperOrder={["label", "input", "description"]}
          style={{ width: "100%" }}
          {...form.getInputProps("requests")}
        />
        <Select
          maw={120}
          data={periodOptions}
          label="Period"
          placeholder="Period"
          inputWrapperOrder={["label", "input", "description"]}
          {...form.getInputProps("period")}
        />
        <Button
          h={36}
          onClick={() => {
            if (formValidation().hasErrors) return;
            if (value.some((v) => v.includes(form.values.period))) {
              return form.setErrors({ period: "Period already exists" });
            }
            setValue((current: any) => [
              form.values.requests + `/` + form.values.period,
              ...current,
            ]),
              form.reset();
          }}
        >
          <IconPlus />
        </Button>
      </Flex>

      <Text c="red.6" size="xs">
        {form.errors.requests}
        <br />
        {form.errors.period}
      </Text>
      <Flex wrap={"wrap"}>{values}</Flex>

      <Button
        fullWidth
        style={{ marginTop: 32 }}
        onClick={handleSubmit}
        loading={isPending && !isSuccess}
      >
        Update Rate Limits
      </Button>
    </Stack>
  );
}
