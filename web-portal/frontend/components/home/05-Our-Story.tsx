import { Container, Group, Text, Stack } from "@mantine/core";
import SectionTitle from "./common/SectionTitle";
import { crimson } from "@frontend/utils/theme";
import textDecor from "@frontend/public/text-decor.png";
import Image from "next/image";
import { useViewportSize } from "@mantine/hooks";

export default function OurStory() {
    const { width } = useViewportSize();
    const isMobile = width < 580;
    return (
        <Container
            mt="xl"
            size='xl'
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <SectionTitle title="Our Story" />

            <Stack align="center" justify="center">
                <Image
                    src={textDecor.src}
                    alt="porters-origin"
                    width={textDecor.width / (isMobile ? 4.5 : 3)}
                    height={textDecor.height / (isMobile ? 4.5 : 3)}
                    style={{ transform: `rotate(180deg)`, marginTop: 48 }}
                />

                <Stack align="center" justify="center" >
                    <Text
                        p={isMobile ? 12 : 16}
                        w={textDecor.width / (isMobile ? 4.5 : 3)}
                        style={{
                            fontFamily: crimson.style.fontFamily,
                            fontSize: isMobile ? 18 : 20,
                        }}
                        lh={1.7}
                    >
                        RaidGuild has rich experience in knowing what blockchain
                        developers really need and how to make their clients
                        happy. We put this knowledge to use by creating PORTERS
                        – a sovereign RPC gateway on POKT.
                    </Text>
                    <Text
                        w={textDecor.width / (isMobile ? 4.5 : 3)}
                        p={isMobile ? 12 : 16}
                        style={{
                            fontFamily: crimson.style.fontFamily,
                            fontSize: isMobile ? 18 : 20,
                        }}
                        lh={1.7}
                    >
                        Rooted deeply in the DePIN movement, we are providing
                        the first RPC gateway made by Web3 developers for Web3
                        developers. We carry on the torch RaidGuild once
                        lightened for leading Web3 out of the dark ages.
                    </Text>
                </Stack>
                <Image
                    src={textDecor.src}
                    alt="porters-origin"
                    width={textDecor.width / (isMobile ? 4.5 : 3)}
                    height={textDecor.height / (isMobile ? 4.5 : 3)}
                />
            </Stack>
        </Container>
    );
}
