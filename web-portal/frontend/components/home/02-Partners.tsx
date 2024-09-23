import { Card, Container, Flex, Grid, Stack, Title } from "@mantine/core";

import raidguildLogo from "@frontend/public/raidguild-logo.png";
import poktLogo from "@frontend/public/pokt-logo.png";
import taikoLogo from "@frontend/public/taiko.png";
import tknLogo from "@frontend/public/tkn-logo.png";
import bitfinityLogo from "@frontend/public/bitfinity-logo.png";
import Image from "next/image";
import SectionTitle from "./common/SectionTitle";
import { useRouter } from "next/navigation";

export default function Partners() {
  const router = useRouter()
    return (
        <Container size="md" mt={"xl"}>
            <SectionTitle title="Our Partners" />
            <Flex wrap='wrap' mt={80} gap={10} rowGap={25} align='center' justify='center'>
                <Card bg='#F6EEE6' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    cursor: "pointer"
                }} onClick={() => window.open('https://raidguild.org', '_blank')}>
                    <Image
                        src={raidguildLogo.src}
                        alt="Raidguild"
                        width={raidguildLogo.width / 3}
                        height={raidguildLogo.height / 3}
                    />
                </Card>
                <Card bg='#F6EEE6' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    cursor: "pointer"
                }} onClick={() => window.open('https://pokt.network', '_blank')}>
                    <Image
                        src={poktLogo.src}
                        alt="Pokt Network"
                        width={poktLogo.width / 3}
                        height={poktLogo.height / 3}
                    />
                </Card>
                <Card bg='#F6EEE6' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    cursor: "pointer"
                }} onClick={() => window.open('https://taiko.xyz', '_blank')}>
                    <Image
                        src={taikoLogo.src}
                        alt="Taiko Network"
                        width={taikoLogo.width / 3}
                        height={taikoLogo.height / 3}
                    />
                </Card>
                <Card bg='#F6EEE6' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    cursor: "pointer"
                }} onClick={() => window.open('https://tkn.xyz/', '_blank')}>
                    <Image
                        src={tknLogo.src}
                        alt="Token Name Service"
                        width={tknLogo.width}
                        height={tknLogo.height}
                    />
                </Card>
                <Card bg='#F6EEE6' p={16} h={70} ml={20} style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    cursor: "pointer"
                }} onClick={() => window.open('https://bitfinity.network/', '_blank')}>
                    <Image
                        src={bitfinityLogo.src}
                        alt="Bitfinity Network"
                        width={bitfinityLogo.width }
                        height={bitfinityLogo.height }
                    />
                </Card>
            </Flex>
        </Container >
    );
}
