import { List, Box, Stack, Container, BackgroundImage, Title, Text, Blockquote, Center } from "@mantine/core";
import WelcomeShape from "@frontend/components/login/welcomeshape";
import background from "@frontend/public/background.png";
import logo from "@frontend/public/logo.png";
import Image from "next/image";
import CommonLinks from "@frontend/components/pricing/Links";

export default function Pricing() {
  return (
    <Box style={{ backgroundColor: "#3C2B27" }}>
      <BackgroundImage src={background.src}>
        <Stack
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: '0 16px',
          }}
        >
          <Box maw={600} px={60} py={32} style={{ textAlign: 'left', color: 'white', backgroundColor: '#2F201C90', gap: 10, borderRadius: 6 }}>
            <Image src={logo.src} width={logo.width} height={logo.height} alt="Logo" style={{ marginBottom: '16px' }} />
            <Title order={1} my={16}>
              Pricing information
            </Title>
            <Text style={{fontSize: 18, opacity: 0.7}}>
              {`PORTERS governs relays through the Gateway via our $PORTR ERC20, enabling the first natively Web3 payment solution for Blockchain RPC Services.`}
            </Text>
            <Title order={3} my={16}>
              {`How do I get $PORTR?`}
            </Title>
            <Blockquote color='carrot.5' mt={16} py={20} pl={10}>
              <List type="ordered">
                <List.Item mb={10} >
                  Swap from any ERC20 you hold on OP / Base / Gnosis / Taiko (more chains coming soon).
                </List.Item>
                <List.Item>
                  Redeem $PORTR in your dashboard.
                </List.Item>
              </List>
            </Blockquote>
            <Center my={20}>
            <Text td="line-through" pr={4} style={{fontSize: 26, textDecorationColor: `#FFA44B`}}> $4.00 </Text>
            <Text  style={{fontSize: 26}}> {`= 1000 $PORTR = 1M Relays`}</Text>
            </Center>
            <Center  my={20} >
            <Text c='carrot' pr={5} style={{fontSize: 26}}>$3.33</Text>
            <Text style={{fontSize: 20}}>{`until June 30th 2024!`} </Text>
            </Center>
          </Box>
          <CommonLinks/>
        </Stack>
      </BackgroundImage>
    </Box>
  );
}
