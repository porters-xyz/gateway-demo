"use client";
import { useSearchParams } from "next/navigation";
import { Modal, TextInput, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createApp } from "./actions";

export default function NewAppModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") == "app";
  const router = useRouter();

  const [state, formAction] = useFormState(
    () => createApp("cls9162dd0000fwri5cu99k1s"),
    null,
  );

  return (
    <Modal
      opened={shouldOpen}
      onClose={() => router.back()}
      title="Create New App"
      centered
    >
      <form action={formAction}>
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
    </Modal>
  );
}
