import { Button, Flex, TextInput, Pill, Stack, Text } from "@mantine/core";
import _ from "lodash";
import { useState } from "react";
import { useForm, matches } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useUpdateRuleMutation } from "@frontend/utils/hooks";
import { useParams, useSearchParams } from "next/navigation";
import { useAtom } from "jotai";
import { existingRuleValuesAtom } from "@frontend/utils/atoms";

export default function AllowedOriginsForm() {
  const appId = useParams()?.app as string;
  const searchParams = useSearchParams();
  const rule = searchParams?.get("rule") as string;
  const { mutateAsync, isPending, isSuccess } = useUpdateRuleMutation(
    appId,
    rule,
  );
  const [value, setValue] = useAtom(existingRuleValuesAtom);

  const form = useForm({
    validate: {
      url: matches(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Enter a valid url that starts with http or https",
      ),
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
              form.setFieldValue("url", "");
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
