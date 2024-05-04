import { Container, Flex, Stack, Title } from "@mantine/core";

import raidguildLogo from "@frontend/public/raidguild-logo.png";
import poktLogo from "@frontend/public/pokt-logo.png";
import Image from "next/image";
import SectionTitle from "./common/SectionTitle";

export default function Partners() {
  return (
    <Container size="md" mt={"xl"}>
      <SectionTitle title="Our Partners" />
      <Flex wrap="wrap" p={40} gap={60} align="center" justify="center">
        <Image src={raidguildLogo.src} alt="svg" width={150} height={39} />
        <Image src={poktLogo.src} alt="svg" width={150} height={40} />
      </Flex>
    </Container>
  );
}
