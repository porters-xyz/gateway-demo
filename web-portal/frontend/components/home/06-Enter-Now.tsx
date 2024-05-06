import enterNow from "@frontend/public/enter-now.png";
import Image from "next/image";
import { Container, Button, Flex } from "@mantine/core";
import Link from "next/link";

export default function EnterNow() {
  return (
    <Container
      style={{
        position: "relative",
      }}
    >
      <Image
        src={enterNow.src}
        width={568}
        height={816}
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
