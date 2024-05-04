import Image from "next/image";
import { Container, Flex, Group, Text } from "@mantine/core";
import portersLogo from "@frontend/public/porter-footer-logo.png";
import poktLogo from "@frontend/public/pokt-logo.png";
import farcasterLogo from "@frontend/public/farcaster-logo.png";
import {
  IconBrandDiscordFilled,
  IconBrandFramerMotion,
  IconBrandGithubFilled,
  IconBrandX,
} from "@tabler/icons-react";
export default function Footer() {
  return (
    <Container mt={"xl"}>
      <Flex align="center" justify="center" gap={10}>
        <Image
          src={portersLogo.src}
          alt="Porters Logo"
          width={135}
          height={75}
        />
        <Text>© 2024</Text>
        <Group>
          <Text>Privacy</Text>
          <Text>Terms & Conditions</Text>
        </Group>
        <Group align="center">
          <Text>Powered By</Text>
          <Image src={poktLogo.src} alt="svg" width={150} height={40} />
        </Group>
        <Group>
          <IconBrandGithubFilled size={45} />
          <IconBrandDiscordFilled size={45} />
          <IconBrandX size={45} />
          <Image src={farcasterLogo.src} alt="svg" width={45} height={45} />
        </Group>
      </Flex>
    </Container>
  );
}
