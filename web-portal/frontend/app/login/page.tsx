"use client";
import { Container, Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFormState } from "react-dom";
import { recoverTenant } from "./actions";
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
    () => recoverTenant(values.key),
    initialState,
  );

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
      <ConnectKitButton />
      <NewTenantModal />
    </Container>
  );
}
