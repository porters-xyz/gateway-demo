"use client";
import { Container, Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createTenant, validateTenant } from "./actions";

export default function Login() {
  const form = useForm({
    initialValues: {
      key: "",
    },
    validate: {
      key: (value) => (value.length === 16 ? null : "Invalid Key"),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => validateTenant(values.key))}>
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
        <TextInput
          label="Secret Key"
          placeholder="Secret"
          width={"full"}
          {...form.getInputProps("key")}
        />
        <Button type="submit" variant="filled" fullWidth>
          Login
        </Button>

        <Button variant="light" fullWidth onClick={() => createTenant()}>
          Create Key
        </Button>
      </Container>
    </form>
  );
}
