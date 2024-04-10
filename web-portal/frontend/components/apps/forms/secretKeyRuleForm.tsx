import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button, Flex, PasswordInput, Title } from "@mantine/core";
import { useSecretKeyMutation } from "@frontend/utils/hooks";
import { useAtomValue } from "jotai";
import { existingRuleValuesAtom } from "@frontend/utils/atoms";

export default function SecretKeyForm() {
  const searchParams = useSearchParams();
  const appId = useParams()?.app as string;
  const { mutateAsync } = useSecretKeyMutation(appId);
  const ruleValues = useAtomValue(existingRuleValuesAtom);
  // TODO- work on this

  console.log(ruleValues);
  return (
    <React.Fragment>
      {ruleValues.length == 1 ? (
        <PasswordInput
          label="Your Secret Key"
          value={searchParams?.get("key") as string}
          readOnly
        />
      ) : (
        <Title order={3} style={{ textAlign: "center" }}>
          Create a secret key for this app
        </Title>
      )}

      <Flex gap={4}>
        {ruleValues.length == 1 && (
          <Button
            fullWidth
            style={{ marginTop: 32 }}
            onClick={() => mutateAsync("delete")}
            variant="outline"
            color="umbra.1"
          >
            Remove Key
          </Button>
        )}
        <Button
          fullWidth
          style={{ marginTop: 32 }}
          onClick={() => {
            const x = mutateAsync("generate");
            console.log(x);
          }}
        >
          Create New
        </Button>
      </Flex>
    </React.Fragment>
  );
}
