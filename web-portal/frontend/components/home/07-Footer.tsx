import Image from "next/image";
import { Container, Flex, Group, Text, Stack } from "@mantine/core";
import portersLogo from "@frontend/public/porter-footer-logo.png";
import poktLogo from "@frontend/public/pokt-logo.png";
import farcasterLogo from "@frontend/public/farcaster-logo.png";
import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandX,
} from "@tabler/icons-react";
import { crimson } from "@frontend/utils/theme";
import { useViewportSize } from "@mantine/hooks";
export default function Footer() {
  const { width: w } = useViewportSize();
  return (
    <Container
      w={w > 996 ? 996 : w}
      p={40}
      style={{ flexWrap: "wrap", fontFamily: crimson.style.fontFamily }}
    >
      <Flex align="center" justify="space-between">
        <Group align="center" justify="center" w="100%">
          <Image
            src={portersLogo.src}
            alt="Porters Logo"
            width={267 * 0.25}
            height={150 * 0.25}
            style={{
              marginBottom: 8,
            }}
          />
          <Text>© 2024</Text>
        </Group>
        <Group w="100%">
          <Text>Privacy</Text>
          <Text>Terms & Conditions</Text>
        </Group>
        <Group align="center" gap={10} w="100%">
          <Text>Powered By</Text>
          <Image src={poktLogo.src} alt="svg" width={80} height={21.84} />
        </Group>
        <Group w="100%">
          <IconBrandGithubFilled size={25} />
          <IconBrandDiscordFilled size={25} />
          <IconBrandX size={25} />
          <Image src={farcasterLogo.src} alt="svg" width={25} height={25} />
        </Group>
      </Flex>
    </Container>
  );
}
