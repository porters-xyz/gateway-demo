"use client";
import { useSearchParams } from "next/navigation";
import {
  Modal,
  Button,
  CopyButton,
  Stack,
  Title,
  Flex,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconCopy, IconClipboardCheck } from "@tabler/icons-react";
import { useSIWE } from "connectkit";

export default function NewAppModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") === "app";
  const secretKey = searchParams.get("key");
  const router = useRouter();
  const session = useSIWE();
  return (
    <Modal
      opened={shouldOpen}
      onClose={() => router.replace("/dashboard")}
      title="Create New App"
      centered
    >
      {!session.isReady && !secretKey && (
        <form onSubmit={() => console.log("create new")}>
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
