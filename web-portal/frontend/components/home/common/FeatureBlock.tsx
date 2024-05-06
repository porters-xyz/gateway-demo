import { Text, Card, Title, Group } from "@mantine/core";
import Image from "next/image";
import footDecor from "@frontend/public/foot-decor.png";
import SVGBlock from "./SVGBlock";
import { crimson } from "@frontend/utils/theme";
export default function FeatureBlock({
    title,
    image,
    description,
}: {
    title: string;
    image: string;
    description: string;
}) {
    return (
        <Card
            bg="umbra.1"
            c="white"
            m={30}
            h={420}
            w={320}
            style={{
                position: "relative",
                fontFamily: crimson.style.fontFamily,
                borderRadius: 10,
            }}
        >
            <Group
                style={{
                    zIndex: 0,
                    position: "absolute",
                    left: 10.5,
                    right: 11,
                }}
            >
                <SVGBlock />
            </Group>
            <Group
                style={{
                    zIndex: 10,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Title order={2} p={20}>
                    {title}
                </Title>
                <Card.Section>
                    <Image src={image} alt={title} width={100} height={100} />
                </Card.Section>
                <Text
                    px={12}
                    lh={1.25}
                    style={{
                        textAlign: "center",
                    }}
                >
                    {description}
                </Text>
                <Image
                    src={footDecor.src}
                    alt={title}
                    width={21}
                    height={15}
                    style={{
                        position: "absolute",
                        bottom: "3%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </Group>
        </Card>
    );
}
