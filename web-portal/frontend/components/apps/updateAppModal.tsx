import {
  useSearchParams,
  usePathname,
  useRouter,
  useParams,
} from "next/navigation";
import { Textarea, TextInput, Button, Modal, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUpdateAppMutation } from "@frontend/utils/hooks";
import _ from "lodash";

export default function UpdateAppModal({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const searchParams = useSearchParams();
  const appId = _.get(useParams(), "app");
  const shouldOpen = Boolean(searchParams?.get("edit"));

  const path = usePathname();
  const router = useRouter();

  const { values, getInputProps } = useForm({
    initialValues: {
      name,
      description,
    },
    validate: {
      name: (value: string) => {
        if (value.length < 3) {
          return "Name should be at least 3 characters long";
        }
      },
    },
  });

  const updateApp = useUpdateAppMutation(String(appId));

  return (
    <Modal
      opened={Boolean(shouldOpen)}
      onClose={() => router.replace(path as string)}
      title={`Update App`}
      centered
    >
      <TextInput
        label="Choose a name for your application"
        placeholder="My application"
        defaultValue={name}
        inputWrapperOrder={["label", "error", "input", "description"]}
        {...getInputProps("name")}
        withAsterisk
      />
      <Textarea
        label="Provide a short description (Optional)"
        placeholder="What are you working on?"
        defaultValue={description}
        inputWrapperOrder={["label", "error", "input", "description"]}
        {...getInputProps("description")}
      />

      <Flex gap={8} mt={32}>
        <Button
          onClick={async () =>
            await updateApp.mutateAsync({
              action: "delete",
              data: {},
            })
          }
          variant="outline"
          color="black"
          fullWidth
        >
          Delete App
        </Button>
        <Button
          onClick={() =>
            updateApp.mutate({
              data: {
                name: values?.name,
                description: values?.description,
              },
              action: "update",
            })
          }
          fullWidth
        >
          Update App
        </Button>
      </Flex>
    </Modal>
  );
}
