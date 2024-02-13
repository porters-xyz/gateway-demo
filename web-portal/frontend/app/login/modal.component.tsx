"use client";
import { Modal, Button, CopyButton, Stack, Title, Flex } from "@mantine/core";
import { IconCopy, IconClipboardCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function NewTenantModal({ secret }: { secret: string }) {
  const router = useRouter();
  return (
    <Modal
      opened={Boolean(secret)}
      onClose={router.back}
      title="Tenant Auth Key Created"
      centered
    >
      <Stack>
        <Title order={4}>
          Your secret tenant key was generated successfully, please protect it
          by keeping it a secret!
        </Title>
        <CopyButton value={secret}>
          {({ copied, copy }) => (
            <Button color={copied ? "teal" : "blue"} onClick={copy}>
              {copied ? (
                <Flex gap={4}>
                  <IconClipboardCheck size={16} /> Copied Secret Tenant Key
                </Flex>
              ) : (
                <Flex gap={4}>
                  <IconCopy size={16} /> Copy Secret Tenant Key
                </Flex>
              )}
            </Button>
          )}
        </CopyButton>
      </Stack>
    </Modal>
  );
}
