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
  const { width } = useViewportSize()
  const dir = width > 920 ? 'row' : 'column'

  return (
    <Container
      size='xl'
      p={40}
      style={{ fontFamily: crimson.style.fontFamily, display: 'flex', flexDirection: dir }}
    >

      <Flex align="center" justify="center" dir="row" gap={5} p={20}>
        <Image
          src={portersLogo.src}
          alt="Porters Logo"
          width={267 * 0.25}
          height={150 * 0.25}
          style={{
            marginBottom: 8,
          }}
        />
        <Text mb={5} >©</Text>
        <Text mb={5} >2024</Text>
      </Flex>

      <Flex align="center" justify="center" dir="row" gap={10} p={20}>
        <Text mb={5} w={100}>Privacy Policy</Text>
        <Text mb={5} w={120}>Terms of Service</Text>
      </Flex>
      <Flex align="center" justify="center" dir="row" gap={10} p={20} mb={5} w={260}>
        <Text>Powered By</Text>
        <Image src={poktLogo.src} alt="svg" width={80} height={21.84} />
      </Flex>
      <Flex align="center" justify="center" dir="row" gap={10} p={20} mb={5}>
        <IconBrandGithubFilled size={25} />
        <IconBrandDiscordFilled size={25} />
        <IconBrandX size={25} />
        <Image src={farcasterLogo.src} alt="svg" width={25} height={25} />
      </Flex>

    </Container >
  );
}
