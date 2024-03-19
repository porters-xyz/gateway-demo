"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Modal,
  Button,
  CopyButton,
  Stack,
  Title,
  Flex,
  TextInput,
} from "@mantine/core";
import { IconCopy, IconClipboardCheck } from "@tabler/icons-react";
import { useSIWE } from "connectkit";
import { useCreateAppMutation } from "./hooks";

export default function NewAppModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") === "app";
  const secretKey = searchParams.get("key");
  const { data, isReady } = useSIWE();
  const createApp = useCreateAppMutation(data?.address);
  const router = useRouter();
  // TOOD: figure when to return the api key

  return (
    <Modal
      opened={shouldOpen}
      onClose={() => router.replace("/dashboard")}
      title="Create New App"
      centered
    >
      {isReady && !secretKey && (
        <form onSubmit={() => createApp.mutateAsync()}>
          <TextInput
            label="App Name"
            placeholder="Name for your app"
            description="Name your app"
            inputWrapperOrder={["label", "error", "input", "description"]}
            withAsterisk
          />

          <Button type="submit" style={{ marginTop: 32 }}>
            Create New App
          </Button>
        </form>
      )}
      {/* @note: following code doesn't work right now as we migrated to api key
      as one of the app rules */}
      {secretKey && (
        <Stack>
          <Title order={4}>
            Your api key was generated successfully, please protect it by
            keeping it a secret!
          </Title>
          <CopyButton value={secretKey}>
            {({ copied, copy }) => (
              <Button color={copied ? "teal" : "blue"} onClick={copy}>
                {copied ? (
                  <Flex gap={4}>
                    <IconClipboardCheck size={16} /> Copied Api Key
                  </Flex>
                ) : (
                  <Flex gap={4}>
                    <IconCopy size={16} /> Copy Api Key
                  </Flex>
                )}
              </Button>
            )}
          </CopyButton>
        </Stack>
      )}
    </Modal>
  );
}
