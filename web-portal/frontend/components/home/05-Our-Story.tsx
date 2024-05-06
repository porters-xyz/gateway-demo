import { Container, Group, Text } from "@mantine/core";
import SectionTitle from "./common/SectionTitle";
import { crimson } from "@frontend/utils/theme";
import textDecor from "@frontend/public/text-decor.png";
import Image from "next/image";

export default function OurStory() {
  return (
    <Container
      mt={"xl"}
      w={610}
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionTitle title="Our Story" />
      <Image
        src={textDecor.src}
        alt="porters-origin"
        width={584}
        height={41}
        style={{ transform: `rotate(180deg)`, marginTop: 48 }}
      />

      <Group align="center" justify="center">
        <Text
          p={16}
          maw={528}
          style={{
            fontFamily: crimson.style.fontFamily,
            fontSize: 20,
          }}
          lh={1.7}
        >
          RaidGuild has rich experience in knowing what blockchain developers
          really need and how to make their clients happy. We put this knowledge
          to use by creating PORTERS – a sovereign RPC gateway on POKT.
        </Text>
        <Text
          maw={528}
          p={16}
          style={{
            fontFamily: crimson.style.fontFamily,
            fontSize: 20,
          }}
          lh={1.7}
        >
          Rooted deeply in the DePIN movement, we are providing the first RPC
          gateway made by Web3 developers for Web3 developers. We carry on the
          torch RaidGuild once lightened for leading Web3 out of the dark ages.
        </Text>
      </Group>
      <Image src={textDecor.src} alt="porters-origin" width={584} height={41} />
    </Container>
  );
}
