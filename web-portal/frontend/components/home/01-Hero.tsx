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
        <Container size="xl" mt={20}>
            <Drawer opened={opened} onClose={close} size="100%">
                <Stack align="center" justify="space-evenly" color="cream.0" >
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
            <Flex align="center" justify="space-between" gap={100} my={15} px={20} >
                <Image
                    src={logo.src}
                    alt="Porters"
                    width={logo.width / 4}
                    height={logo.height / 4}
                />
                {width >= 800 ? (
                    <Flex
                        align="center"
                        justify="flex-end"
                        gap={60}
                        wrap="wrap"
                        color="umbra.1"
                        w={'100%'}
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
                    <Burger opened={opened} onClick={open} />
                )}
            </Flex>
            <Flex align={width <= 900 ? 'center' : 'flex-start'} justify="flex-start" p={30} h={500} pos='relative' bg='white' style={{
                borderRadius: 30,
                overflow: 'clip'
            }}>
                <Box p={30} mt={!isMobile ? 50 : 0}>
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
                        maw={isMobile ? 400 : 450}
                        style={{
                            fontFamily: crimson.style.fontFamily,
                            fontSize: isMobile ? 18 : 19,
                        }}
                        lh={1.7}
                    >
                        {`Accelerate your Web3 journey with our plug-and-play
                        platform offering comprehensive analytics, Web3-native
                        developer suite and hassle-free access to POKT's
                        Decentralised RPC Service – simplifying your build from
                        concept to execution.`}
                    </Text>

                    <Group mt={30}>
                        <Link href="#">
                            <Button>Coming Soon</Button>
                        </Link>
                    </Group>
                </Box>
                {width > 900 && (
                    <Box>
                        <Image
                            src={heroImage.src}
                            alt="Porters Gateway"
                            width={heroImage.width / 4.5}
                            height={heroImage.height / 4.5}
                        />
                    </Box>
                )}
            </Flex>
        </Container>
    );
}
