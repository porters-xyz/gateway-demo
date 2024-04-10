import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Button,
  Tooltip,
  CopyButton,
  Title,
  Stack,
  Text,
  Flex,
  CheckIcon,
} from "@mantine/core";
import { useSecretKeyMutation } from "@frontend/utils/hooks";
import { useAtomValue } from "jotai";
import { existingRuleValuesAtom } from "@frontend/utils/atoms";
import { IconCopy } from "@tabler/icons-react";

const SecretKeyDisplay = ({ secret }: { secret: string }) => (
  <Stack align="center">
    <Title order={3}>{`Here's your newly generated secret key`}</Title>
    <CopyButton value={secret}>
      {({ copied, copy }) => (
        <Tooltip
          label={
            !copied ? (
              "Copy Secret Key"
            ) : (
              <Flex align="center">
                <CheckIcon size={12} style={{ marginRight: 8 }} />
                <Text> Copied Secret Key </Text>
              </Flex>
            )
          }
          bg={!copied ? "carrot" : "green"}
          withArrow
        >
          <Title
            order={3}
            c={"black"}
            style={{ textAlign: "center", borderRadius: 8 }}
            bg={"gray"}
            p={4}
            onClick={copy}
            w={"100%"}
          >
            <IconCopy size={16} style={{ marginRight: 8 }} />
            {secret}
          </Title>
        </Tooltip>
      )}
    </CopyButton>
    <Text>
      This key is used to authenticate your app with the X-API field. Keep it
      safe and do not share it with anyone.
    </Text>
    <Text c="red">Note: You will only see it once.</Text>
  </Stack>
);

const SecretKeyGenerator = ({
  ruleValues,
  onGenerate,
  isPending,
  isSuccess,
  action,
}: {
  ruleValues: Array<string>;
  onGenerate: () => void;
  isPending: boolean;
  isSuccess: boolean;
  action: string | null;
}) => (
  <Stack align="center">
    <Title order={3}>Generate a new secret key</Title>
    <Text>
      {ruleValues.length > 0
        ? "You already have created a secret key for this app, However, you can create a new one. The previous key will no longer work!"
        : "Generate a Key to authenticate your app with the X-API field."}
    </Text>
    <Text c="red">Note: You will only see it once.</Text>

    <Button
      fullWidth
      onClick={onGenerate}
      style={{ marginTop: 32 }}
      loading={isPending && !isSuccess && action === "generate"}
    >
      Generate New
    </Button>
  </Stack>
);

export default function SecretKeyForm() {
  const appId = useParams()?.app as string;
  const searchParams = useSearchParams();
  const { mutateAsync, isPending, isSuccess } = useSecretKeyMutation(appId);
  const ruleValues = useAtomValue(existingRuleValuesAtom);
  const key = searchParams?.get("key") as string;
  const [action, setAction] = useState<null | string>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setAction("generate");
    await mutateAsync("generate");
  };

  return (
    <React.Fragment>
      {key ? (
        <SecretKeyDisplay secret={key} />
      ) : (
        <SecretKeyGenerator
          ruleValues={ruleValues}
          onGenerate={handleGenerate}
          isPending={isPending}
          isSuccess={isSuccess}
          action={action}
        />
      )}

      {!key && ruleValues.length > 0 && (
        <Button
          fullWidth
          onClick={async () => {
            setAction("delete");
            await mutateAsync("delete");
            router.push(`/apps/${appId}?i=rules`);
          }}
          variant="outline"
          color="black"
          loading={isPending && !isSuccess && action === "delete"}
          style={{ marginTop: 16 }}
        >
          Remove Secret Key
        </Button>
      )}
    </React.Fragment>
  );
}
