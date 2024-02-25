"use client";
import { Container, Button, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFormState } from "react-dom";
import { createTenant, validateTenant } from "./actions";
import NewTenantModal from "./modal.component";
import { ConnectKitButton } from "connectkit";

const initialState = {
  key: "",
};

export default function Login() {
  const { values, getInputProps } = useForm({
    initialValues: initialState,
    validateInputOnChange: true,
    validate: {
      key: (value) => (value.length === 16 ? null : "Invalid Key"),
    },
  });

  const [validated, validateAction] = useFormState(
    () => validateTenant(values.key),
    initialState,
  );

  const [created, createAction] = useFormState(createTenant, null);

  return (
    <Container
      style={{
        height: "100vh",
        width: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <form action={validateAction}>
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
          style={{ marginTop: 8 }}
        >
          Login
        </Button>
      </form>

      <form action={createAction}>
        <Button type="submit" variant="light" fullWidth>
          Create Key
        </Button>
      </form>
      <ConnectKitButton />
      <NewTenantModal />
    </Container>
  );
}
