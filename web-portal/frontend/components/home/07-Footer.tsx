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
import { useRouter } from "next/navigation";

export default function Footer() {
  const { width } = useViewportSize();
  const dir = width > 920 ? "row" : "column";
  const router = useRouter();
  return (
    <Container
      size="lg"
      p={40}
      style={{
        fontFamily: crimson.style.fontFamily,
        display: "flex",
        flexDirection: dir,
      }}
    >
      <Flex align="center" justify="center" dir="row" gap={5} p={20}>
        <Image
          src={portersLogo.src}
          alt="Porters Logo"
          width={267 * 0.25}
          height={150 * 0.25}
          style={{
            marginBottom: 8,
            cursor: "pointer",
          }}
        />
        <Text mb={5}>©</Text>
        <Text mb={5}>2024</Text>
      </Flex>

      <Flex align="center" justify="center" dir="row" gap={10} p={20}>
        <Text
          mb={5}
          w={120}
          onClick={() => router.push("tos")}
          style={{ cursor: "pointer" }}
        >
          Terms of Service
        </Text>
      </Flex>

      <Flex
        align="center"
        justify="center"
        dir="row"
        gap={10}
        p={20}
        mb={5}
        w={260}
        onClick={() => router.replace("https://pokt.network/")}
        style={{ cursor: "pointer" }}
      >
        <Text>Powered By</Text>
        <Image src={poktLogo.src} alt="svg" width={80} height={21.84} />
      </Flex>
      <Flex align="center" justify="center" dir="row" gap={10} p={20} mb={5}>
        <IconBrandGithubFilled
          size={25}
          onClick={() => router.replace("https://github.com/porters-xyz")}
          style={{ cursor: "pointer" }}
        />

        <IconBrandDiscordFilled
          size={25}
          onClick={() => router.replace("https://discord.gg/GZywNxPJgd")}
          style={{ cursor: "pointer" }}
        />

        <IconBrandX
          size={25}
          onClick={() => router.replace("https://twitter.com/PORTERSXYZ")}
          style={{ cursor: "pointer" }}
        />

        <Image
          src={farcasterLogo.src}
          alt="svg"
          width={25}
          height={25}
          onClick={() => router.replace("https:/warpcast.com/porters")}
          style={{ cursor: "pointer" }}
        />
      </Flex>
    </Container>
  );
}
