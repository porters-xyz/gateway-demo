import {
  Modal,
  Button,
  CopyButton,
  Stack,
  Title,
  Flex,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCopy, IconClipboardCheck } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const initialState = {
  key: "",
};
