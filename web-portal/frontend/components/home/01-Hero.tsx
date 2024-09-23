import React, { useState, useEffect } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NavDrawer from "./common/Drawer";
import {
    Container,
    Title,
    Button,
    Burger,
    Flex,
    Group,
    Text,
    Box,
} from "@mantine/core";
import Image from "next/image";
import logo from "@frontend/public/monochrome_logo.png";
import heroImage from "@frontend/public/hero_image.png";
import backgroundOne from "@frontend/public/background_1.png";
import Link from "next/link";
import { useViewportSize, useDisclosure } from "@mantine/hooks";
import { crimson, redRose } from "@frontend/utils/theme";
import NavLinks from "./common/NavLinks";
import { useRouter } from "next/navigation";


export default function HeroSection({hideImageSection}: {hideImageSection?: boolean}) {
    const { width } = useViewportSize();
    const router = useRouter()
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = width < 580;
    const heroWidth = width > 1100 ? 1000 :
        width < 1100 && width > 800 ? width * 0.75 :
            width * 0.8

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    const HeroHeader = () => {
      return(
        <Flex align={width <= 900 ? 'center' : 'flex-start'} mt={30}
            justify="flex-start" p={30} h={500} pos='relative' bg='white' style={{
                borderRadius: 30,
                overflow: 'clip',
            }}>
            <Box p={30} mt={!isMobile ? 30 : 0} style={{
                zIndex: 100,
                width: heroWidth
            }}>
                {isLoading ? (
                    <Skeleton height={40} width={300} />
                ) : (
                    <Title
                        style={{
                            fontFamily: redRose.style.fontFamily,
                            fontWeight: 600,
                            fontSize: 36,
                        }}
                    >
                        Your Gateway to Web3
                    </Title>
                )}
                {isLoading ? (
                    <Skeleton count={4} style={{ marginTop: '1rem' }} />
                ) : (
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
                )}

                <Group mt={30}>
                    {isLoading ? (
                        <Skeleton width={120} height={40} />
                    ) : (
                        <Link href="/login">
                            <Button>Get Started</Button>
                        </Link>
                    )}
                </Group>
            </Box>
            {width > 900 && (
                <Box right={-100} ml={20} pos={'absolute'} top={-20}>
                    {isLoading ? (
                        <Skeleton width={heroImage.width / 3} height={heroImage.height / 3} />
                    ) : (
                        <Image
                            src={heroImage.src}
                            alt="Porters Gateway"
                            width={heroImage.width / 3}
                            height={heroImage.height / 3}
                        />
                    )}
                </Box>
            )}
        </Flex>
      )
    }

    return (
        <Container size="lg" mt={20}>
           <NavDrawer opened={opened} close={close}/>
            <Flex align="center" justify="space-between" gap={100} mt={10} px={20}>
            {isLoading ? (
                <Skeleton width={logo.width / 4} height={logo.height / 4} />
            ) : (
                <Image
                    onClick={() => router.push('/')}
                    style={{
                      cursor: "pointer"
                    }}
                    src={logo.src}
                    alt="Porters"
                    width={logo.width / 4}
                    height={logo.height / 4}
                />
            )}
                {width >= 800 ? (
                    <Flex
                        align="center"
                        justify="flex-end"
                        gap={60}
                        wrap="wrap"
                        color="umbra.1"
                        w={'100%'}
                    >
                        {isLoading ? (
                            <Skeleton width={300} height={20} />
                        ) : (
                            <NavLinks/>
                        )}
                    </Flex>
                ) : (
                    <Burger opened={opened} onClick={open} />
                )}
            </Flex>

            {!hideImageSection && <HeroHeader/>}

        </Container >
    );
}
