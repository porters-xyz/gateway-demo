import { Card, Container, Flex, Grid, Stack, Title } from "@mantine/core";

import raidguildLogo from "@frontend/public/raidguild-logo.png";
import poktLogo from "@frontend/public/pokt-logo.png";
import taikoLogo from "@frontend/public/taiko.png";
import Image from "next/image";
import SectionTitle from "./common/SectionTitle";

export default function Partners() {
    return (
        <Container size="md" mt={"xl"}>
            <SectionTitle title="Our Partners" />
            <Flex wrap='wrap' mt={80} gap={10} rowGap={10} align='center' justify='center'>
                <Card bg='#fff' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10
                }}>
                    <Image
                        src={raidguildLogo.src}
                        alt="Raidguild"
                        width={raidguildLogo.width / 3}
                        height={raidguildLogo.height / 3}
                    />
                </Card>
                <Card span={3.75} bg='#fff' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10
                }}>
                    <Image
                        src={poktLogo.src}
                        alt="Pokt Network"
                        width={poktLogo.width / 3}
                        height={poktLogo.height / 3}
                    />
                </Card>
                <Card bg='#fff' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10
                }}>
                    <Image
                        src={taikoLogo.src}
                        alt="Taiko Network"
                        width={taikoLogo.width / 3}
                        height={taikoLogo.height / 3}
                    />
                </Card>
            </Flex>
        </Container >
    );
}
