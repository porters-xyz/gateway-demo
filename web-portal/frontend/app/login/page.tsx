"use client";
import { Container, Button, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFormState } from "react-dom";

import { createTenant, validateTenant } from "./actions";

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

  const [state, formAction] = useFormState(
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
      <form action={formAction}>
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

      <Text>{JSON.stringify(state)}</Text>

      <form action={createAction}>
        <Button type="submit" variant="light" fullWidth>
          Create Key
        </Button>
        {created ? JSON.stringify(created) : null}
      </form>
    </Container>
  );
}
