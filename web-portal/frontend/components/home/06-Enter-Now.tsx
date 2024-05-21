import enterNow from "@frontend/public/enter-now.png";
import Image from "next/image";
import { Container, Button, Flex } from "@mantine/core";
import Link from "next/link";
import { useViewportSize } from "@mantine/hooks";

export default function EnterNow() {
    const { width } = useViewportSize();
    const isMobile = width < 580;
    const isSuperSmall = width < 400
    return (
        <Container
            style={{
                position: "relative",
            }}
        >
            <Image
                src={enterNow.src}
                width={enterNow.width / (isMobile ? isSuperSmall ? 4.5 : 5 : 3)}
                height={enterNow.height / (isMobile ? isSuperSmall ? 4.5 : 5 : 3)}
                alt="Enter the Porters Gateway"
            />
            <Flex
                style={{
                    position: "absolute",
                    top: "58%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Link href="#">
                    <Button>Coming Soon</Button>
                </Link>
            </Flex>
        </Container>
    );
}
