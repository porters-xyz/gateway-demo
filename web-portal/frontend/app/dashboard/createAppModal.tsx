"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Button, TextInput, Textarea } from "@mantine/core";
import { useSIWE } from "connectkit";
import { useCreateAppMutation } from "./hooks";
import { useForm } from "@mantine/form";

export default function CreateAppModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") === "app";
  const secretKey = searchParams.get("key");
  const { data, isReady } = useSIWE();

  const { values } = useForm({
    initialValues: {
      name: "",
      description: "",
    },

    validate: {
      name: (value) => {
        if (value.length < 3) {
          return "Name should be at least 3 characters long";
        }
      },
    },
  });

  const createApp = useCreateAppMutation(data?.address, values);
  const router = useRouter();
  // TOOD: figure when to return the api key

  return (
    <Modal
      opened={shouldOpen}
      onClose={() => router.replace("/dashboard")}
      title="Create a new application."
      centered
    >
      {isReady && !secretKey && (
        <form onSubmit={() => createApp.mutateAsync()}>
          <TextInput
            label="Choose a name for your application"
            placeholder="My application"
            inputWrapperOrder={["label", "error", "input", "description"]}
            withAsterisk
          />
          <Textarea
            label="Provide a short description (Optional)"
            placeholder="What are you working on?"
            inputWrapperOrder={["label", "error", "input", "description"]}
            withAsterisk
          />

          <Button type="submit" fullWidth style={{ marginTop: 32 }}>
            Create New App
          </Button>
        </form>
      )}
    </Modal>
  );
}
