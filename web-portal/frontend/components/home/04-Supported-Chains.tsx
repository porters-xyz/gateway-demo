import { Container, Flex, Title, Text, Stack, Grid, Box } from "@mantine/core";
import { redRose, crimson } from "@frontend/utils/theme";
import { chainLogos } from "@frontend/utils/consts";
import Image from "next/image";

const chainLogosInGrid = chainLogos.map((c: (typeof chainLogos)[0]) => (
    <Box
        key={c.src}
        m={8}
        h={c.height}
        w={c.width}
        opacity={0.8}
        bg="#fff"
        style={{
            display: "flex",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <Image
            src={c.src}
            height={(c.height * 2) / 4}
            width={(c.width * 2) / 4}
            alt={"logo"}
        />
    </Box>
));

export default function SupportedChains() {
    return (
        <Container
            size="md"
            mt={"xl"}
            c="umbra"
            style={{
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Title
                style={{
                    fontFamily: redRose.style.fontFamily,
                    fontWeight: 600,
                    fontSize: 40,
                }}
            >
                More than 40+
                <br />
                supported chains
            </Title>
            <Text
                opacity={0.9}
                mt="md"
                style={{
                    fontFamily: crimson.style.fontFamily,
                    fontSize: 20,
                    textAlign: "center",
                }}
            >
                Look ma {` `}
                <s>no hands</s> how many chains we support!
            </Text>

            <Grid m={24} p={10} align="center" justify="center">
                {chainLogosInGrid}
            </Grid>
        </Container>
    );
}
