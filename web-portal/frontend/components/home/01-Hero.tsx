import React from "react";
import {
    Container,
    Title,
    Button,
    Burger,
    Flex,
    Group,
    Text,
    Box,
    Drawer,
    Stack,
} from "@mantine/core";
import Image from "next/image";
import logo from "@frontend/public/monochrome_logo.png";
import heroImage from "@frontend/public/hero_image.png";
import backgroundOne from "@frontend/public/background_1.png";
import Link from "next/link";
import { useViewportSize, useDisclosure } from "@mantine/hooks";
import { crimson, redRose } from "@frontend/utils/theme";

export default function HeroSection() {
    const { width } = useViewportSize();
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = width < 580;

    return (
        <Container size="md" mt={20}>
            <Drawer opened={opened} onClose={close} size="100%">
                <Stack align="center" justify="space-evenly" color="umbra.1">
                    <Title size={24} fw={700}>
                        Home
                    </Title>

                    <Title size={24} fw={500}>
                        Pricing
                    </Title>
                    <Title size={24} fw={500}>
                        Swap
                    </Title>
                    <Title size={24} fw={500}>
                        Documentation
                    </Title>
                </Stack>
            </Drawer>
            <Flex align="center" justify="space-between" gap={100} my={20}>
                <Image
                    src={logo.src}
                    alt="hello"
                    width={logo.width / 4}
                    height={logo.height / 4}
                />
                {!isMobile ? (
                    <Flex
                        align="center"
                        justify="space-evenly"
                        w={800}
                        wrap="wrap"
                        color="umbra.1"
                    >
                        <Title size={18} fw={700}>
                            Home
                        </Title>

                        <Title size={18} fw={500}>
                            Pricing
                        </Title>
                        <Title size={18} fw={500}>
                            Swap
                        </Title>
                        <Title size={18} fw={500}>
                            Documentation
                        </Title>
                    </Flex>
                ) : (
                    <Burger opened={opened} onClick={open} hiddenFrom="sm" />
                )}
            </Flex>
            <Flex align="center" justify="space-between" gap={100}>
                <Box>
                    <Title
                        style={{
                            fontFamily: redRose.style.fontFamily,
                            fontWeight: 600,
                            fontSize: 36,
                        }}
                    >
                        Your Gateway to Web3
                    </Title>
                    <Text
                        c="umbra"
                        opacity={0.9}
                        mt="md"
                        maw={isMobile ? 400 : 500}
                        style={{
                            fontFamily: crimson.style.fontFamily,
                            fontSize: isMobile ? 18 : 20,
                        }}
                        lh={1.7}
                    >
                        Accelerate your Web3 journey with our plug-and-play
                        platform offering comprehensive analytics, Web3-native
                        developer suite and hassle-free access to POKT’s
                        Decentralised RPC Service – simplifying your build from
                        concept to execution.
                    </Text>

                    <Group mt={30}>
                        <Link href="#">
                            <Button>Coming Soon</Button>
                        </Link>
                    </Group>
                </Box>
                {!isMobile && (
                    <Box>
                        {/* TODO: Add backgroundOne image */}
                        <Image
                            src={heroImage.src}
                            alt="hello"
                            width={400}
                            height={400}
                        />
                    </Box>
                )}
            </Flex>
        </Container>
    );
}
