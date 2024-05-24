import {
  CopyButton,
  Divider,
  Text,
  Stack,
  Title,
  Flex,
  Card,
  ActionIcon,
  Tooltip,
  rem,
} from "@mantine/core";
import _ from "lodash";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export default function DisplayItem({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <Stack gap={8} mt={20}>
      <Title order={2}>{title}</Title>

      <Flex
        dir="row"
        justify="space-between"
        align="flex-start"
        style={{ flexWrap: "wrap" }}
        gap={20}
      >
        <Text opacity={0.5} w={500}>
          {description}
        </Text>

        <CopyButton value={value} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              withArrow
              position="right"
              color={copied ? "teal" : "carrot"}
            >
              <ActionIcon
                c={"white"}
                color={copied ? "carrot" : "blue"}
                onClick={copy}
                size="lg"
                w="max-content"
                px={10}
              >
                {value}
                {copied ? (
                  <IconCheck style={{ width: rem(16), marginLeft: 4 }} />
                ) : (
                  <IconCopy style={{ width: rem(16), marginLeft: 4 }} />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Flex>
      <Divider size="xs" />
    </Stack>
  );
}
