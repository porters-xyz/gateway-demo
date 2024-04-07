"use client";
import React from "react";
import {
  Container,
  Title,
  Button,
  Flex,
  Group,
  Text,
  Box,
  em,
} from "@mantine/core";
import Image from "next/image";
import logo from "@frontend/public/monochrome_logo.png";
import heroImage from "@frontend/public/hero_image.png";
import backgroundOne from "@frontend/public/background_1.png";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";

export function HeroSection() {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

  return (
    <Container size="md">
      <Flex align="center" justify="space-between" gap={100} mb={40} p={10}>
        <Image src={logo.src} alt="hello" width={160} height={58} />
        {!isMobile && (
          <Flex
            align="center"
            justify="space-evenly"
            w={800}
            wrap="wrap"
            color="umbra.1"
          >
            <Title order={3} fw={700}>
              Home
            </Title>
            <Title order={3} fw={500}>
              Tools
            </Title>
            <Title order={3} fw={500}>
              Pricing
            </Title>
            <Title order={3} fw={500}>
              Swap
            </Title>
            <Title order={3} fw={500}>
              Documentation
            </Title>
          </Flex>
        )}
      </Flex>
      <Flex align="center" justify="space-between" gap={100}>
        <Box>
          <Title>Your Gateway to Web3</Title>
          <Text c="umbra" opacity={0.5} mt="md" maw={isMobile ? 400 : 500}>
            Accelerate your Web3 journey with our plug-and-play platform
            offering comprehensive analytics, Web3-native developer suite and
            hassle-free access to POKT’s Decentralised RPC Service – simplifying
            your build from concept to execution.
          </Text>

          <Group mt={30}>
            <Link href="#">
              <Button>Coming Soon</Button>
            </Link>
          </Group>
        </Box>
        {!isMobile && (
          <Box>
            <Image src={heroImage.src} alt="hello" width={400} height={400} />
          </Box>
        )}
      </Flex>
    </Container>
  );
}
