import { Container, Stack, Button, TextInput } from "@mantine/core";

export default function Login() {
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
      <TextInput label="Secret Key" placeholder="Secret" width={"full"} />
      <Button variant="filled" fullWidth>
        Login
      </Button>

      <Button variant="light" fullWidth>
        Create Key
      </Button>
    </Container>
  );
}
