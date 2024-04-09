import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button, Flex, PasswordInput } from "@mantine/core";
import { useSecretKeyMutation } from "@frontend/utils/hooks";
import { useAtomValue } from "jotai";
import { existingRuleValuesAtom } from "@frontend/utils/atoms";

export default function SecretKeyForm() {
  const searchParams = useSearchParams();
  const appId = useParams()?.app as string;
  const { mutateAsync: updateSecretKey } = useSecretKeyMutation(appId);
  const ruleValues = useAtomValue(existingRuleValuesAtom);
  // TODO- work on this

  console.log(ruleValues);
  return (
    <React.Fragment>
      <PasswordInput
        label="Your Secret Key"
        value={searchParams?.get("key") as string}
        readOnly
      />

      <Flex>
        <Button
          fullWidth
          style={{ marginTop: 32 }}
          onClick={() => updateSecretKey("delete")}
        >
          Remove Key
        </Button>
        <Button
          fullWidth
          style={{ marginTop: 32 }}
          onClick={() => updateSecretKey("generate")}
        >
          Create New
        </Button>
      </Flex>
    </React.Fragment>
  );
}
