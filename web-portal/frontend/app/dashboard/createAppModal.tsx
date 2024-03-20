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

  const { values, getInputProps } = useForm({
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

  return (
    <Modal
      opened={shouldOpen}
      onClose={() => console.log("gonna close")}
      title="Create a new application."
      centered
    >
      {isReady && !secretKey && (
        <form>
          <TextInput
            label="Choose a name for your application"
            placeholder="My application"
            inputWrapperOrder={["label", "error", "input", "description"]}
            {...getInputProps("name")}
            withAsterisk
          />
          <Textarea
            label="Provide a short description (Optional)"
            placeholder="What are you working on?"
            inputWrapperOrder={["label", "error", "input", "description"]}
            {...getInputProps("description")}
          />

          <Button
            onClick={() => createApp.mutate()}
            fullWidth
            style={{ marginTop: 32 }}
          >
            Create New App
          </Button>
        </form>
      )}
    </Modal>
  );
}
