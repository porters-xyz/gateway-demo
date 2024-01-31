"use client";
import { Container, Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";

const validateTenant = async (key: string) => {
  try {
    const response = await axios.get(
      "http://localhost:4000/tenant/validate/" + key,
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error making GET request:", error.message);
  }
};

const createTenant = async () => {
  try {
    const response = await axios.get("http://localhost:4000/tenant/create");
    console.log(response.data);
  } catch (error) {
    console.error("Error making POST request:", error.message);
  }
};

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
