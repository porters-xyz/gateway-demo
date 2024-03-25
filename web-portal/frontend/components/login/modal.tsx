import {
  Modal,
  Button,
  CopyButton,
  Stack,
  Title,
  Flex,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRecoverTenant } from "@frontend/utils/hooks";
import { IconCopy, IconClipboardCheck } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const initialState = {
  key: "",
};

// TODO: move it to apt place (after /dashboard login)
export function NewTenantModal() {
  const router = useRouter();
  const secret = useSearchParams()?.get("secret");

  return (
    <Modal
      opened={Boolean(secret)}
      onClose={() => router.replace("/login")}
      title="Tenant Auth Key Created"
      centered
    >
      <Stack>
        <Title order={4}>
          Your secret tenant key was generated successfully, please protect it
          by keeping it a secret!
        </Title>
        <CopyButton value={String(secret)}>
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

export function RecoverTenantModal() {
  const searchParams = useSearchParams();
  const showRecover = searchParams.get("recover") === "true";
  const router = useRouter();

  const { values, getInputProps } = useForm({
    initialValues: initialState,
    validateInputOnChange: true,
    validate: {
      key: (value) => (value.length === 16 ? null : "Invalid Key"),
    },
  });

  const [submit, setSubmit] = useState(false);

  const tenant = useRecoverTenant(values?.key, submit);
  return (
    <Modal
      opened={Boolean(showRecover)}
      onClose={() => router.replace("/login")}
      title="Recover User Account"
      centered
    >
      <Stack>
        <Title order={4}>
          You can recover your user account if you have your secret key,
          generated during signup.
        </Title>
        <form onSubmit={() => setSubmit(true)}>
          <TextInput
            label="Secret Key"
            placeholder="Secret"
            width={"full"}
            {...getInputProps("key")}
          />

          <Button
            type="submit"
            variant="filled"
            fullWidth
            color="umbra.1"
            style={{ marginTop: 8 }}
          >
            Recover User
          </Button>
        </form>
      </Stack>
    </Modal>
  );
}
