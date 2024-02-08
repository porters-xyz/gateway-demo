"use client";
import { redirect, useSearchParams } from "next/navigation";
import { Modal, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { createApp } from "./actions";

export default function NewAppModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") == "app";
  const router = useRouter();

  const [state, formAction] = useFormState(createApp, null);

  return (
    <Modal
      opened={shouldOpen}
      onClose={router.back}
      title="Create New App"
      centered
    >
      <form action={formAction}>
        {/* <TextInput
          label="App Name"
          placeholder="Name for your app"
          description="Name your app"
          inputWrapperOrder={["label", "error", "input", "description"]}
          withAsterisk
        /> */}

        <Button type="submit" style={{ marginTop: 32 }}>
          Create New App
        </Button>
      </form>

      {JSON.stringify(state?.secretKey) ?? ""}
    </Modal>
  );
}
