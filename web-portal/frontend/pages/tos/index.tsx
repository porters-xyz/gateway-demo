import { Container, Title, Stack, Text, Group, Flex, Burger } from "@mantine/core";
import HeroSection from "@frontend/components/home/01-Hero";
import Footer from "@frontend/components/home/07-Footer";
import logo from "@frontend/public/monochrome_logo.png";
import { useViewportSize, useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import NavDrawer from "@frontend/components/home/common/Drawer";
import { useRouter } from "next/navigation";
import NavLinks from "@frontend/components/home/common/NavLinks";
export default function TOSpage() {

  const { width } = useViewportSize();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = width < 580;
  const heroWidth = width > 1100 ? 1000 :
      width < 1100 && width > 800 ? width * 0.75 :
          width * 0.8

  const router = useRouter()

  return (

    <Stack bg="cream.0" gap={160} >
        <Container size="lg" p={20}>

        <Flex align="center" justify="space-between" gap={100} mt={10} px={40} mb={100}>
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
            {width >= 800 ? (
                <Flex
                    align="center"
                    justify="flex-end"
                    gap={60}
                    wrap="wrap"
                    color="umbra.1"
                    w={'100%'}
                >
                   <NavLinks/>
                </Flex>
            ) : (
                <Burger opened={opened} onClick={open} />
            )}
        </Flex>

        <NavDrawer opened={opened} close={close}/>


              <Group mb={30}>
                <Title w='100%' order={1}>Terms of Service</Title>
                <Text>Last Updated: 2024-05-26</Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>1. Acceptance of Terms</Title>
                <Text>
                  By using the PORTERS platform reachable under porters.xyz (hereinafter referred to as the Platform), or services
                  (the “Services”) offered by DATA GATEWAYS LLC (hereinafter referred to as the Company), you (the “User”, “They”)
                  are agreeing to these Terms of Services ("Terms''). If the User does not agree to these Terms, they must refrain
                  from using the Services and the Platform.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>2. Access to the Service</Title>
                <Text>
                  The User must be able to enter legally binding contracts to use the Platform and the Services. By using the
                  Services and the Platform, the User acknowledges and affirms that the User is able to enter into binding
                  contractual relationships.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>3. Use of the Service</Title>
                <Text>
                  The User agrees to use the Services and the Platform only for lawful purposes and comply with any sanctions laws
                  and law enforcement authorities in your jurisdiction. The User must not use the Services or the Platform in any
                  way that is unlawful, or harms the Company or any third party.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>4. Privacy</Title>
                <Text>
                  The Company does not store, process, or share personal data except your IPv4 or IPv6 address, the signatures the
                  User performs using an EVM-compatible key pair (hereinafter referred to as “Key”). The Company also stores the
                  User’s public Key. The user may request the deletion of such data and the closure of the User’s account via
                  email to info@porters.xyz. The User understands that through your use of the Services and the Platform, They
                  consent to the collection and use of this information in accordance with the Terms.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>5. User Responsibilities</Title>
                <Text>
                  The User is responsible for the use of the Services and the Platform, as well as any data They may provide. The
                  User certifies that all data provided is accurate and up to date.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>6. User Conduct and Rights</Title>
                <Text>
                  The User is granted a limited, non-exclusive, non-transferable, revocable licence, without the right to
                  sublicense, to make use of the Services and the Platform.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>7. Fair Use</Title>
                <Text>
                  The User agrees to use the Services and the Platform fairly and responsibly, within the bounds of the law, as
                  well as these Terms.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>8. Termination</Title>
                <Text>
                  The User acknowledges that the Company provides the Services and the Platform as is, without warranty, and at
                  its sole discretion. The Services and the Platform may be terminated for the User by the Company at any time,
                  for any reason or for no reason, including but not limited to, a breach of these Terms, without notice.
                </Text>
                <Text>
                  The Company reserves the right, in its sole discretion, to refuse service, to block or prevent future access to
                  and use of the Platform and the Services, to terminate any User’s account, and to alter or delete any material
                  submitted to the Services or the Platform through by the User. Following termination of this licence, these
                  Terms shall apply to the extent practicable.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>9. Intellectual Property Rights</Title>
                <Text>
                  The Company owns and retains all intellectual property rights in the Service and the Platform. The User may not
                  use the Company’s intellectual property rights without prior written permission by legal representatives of the
                  Company.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>10. Limitation of Liability</Title>
                <Text>
                  To the fullest extent permitted by law, the Company shall not be liable for any direct, indirect, incidental,
                  special, consequential, or exemplary damages, including but not limited to damages for loss of profits,
                  goodwill, use, data, or other intangible losses resulting from your use of the Service or the Platform.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>11. Indemnification</Title>
                <Text>
                  The User agrees to indemnify, defend and hold harmless us, the Company’s officers, directors, employees, agents,
                  and third parties, for any losses, costs, liabilities, and expenses (including reasonable attorneys’ fees)
                  relating to or arising out of The User’s use of or inability to use the Service or the Platform, any user data
                  provided, your violation of these Terms, or your violation of any rights of a third party, or the User’s
                  violation of any applicable laws, rules or regulations.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>12. Changes to the Terms</Title>
                <Text>
                  The Company reserves the right to change these Terms at any time. The Company will notify the User of any
                  changes by posting the new Terms at porters.xyz/terms. The User’s continued use of the Services and the Platform
                  after the effective date of the new Terms constitutes your agreement to the new Terms.
                </Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>13. Governing Law</Title>
                <Text>These Terms shall be governed by and construed in accordance with the laws of Wyoming, United States.</Text>
                <Text>The court of law is Wyoming, United States.</Text>
              </Group>

              <Group mb={30}>
                <Title w='100%' order={2}>14. Contact</Title>
                <Text>Please contact us at info@porters.xyz.</Text>
              </Group>
            </Container>
      <Footer/>
    </Stack>

  )
}
