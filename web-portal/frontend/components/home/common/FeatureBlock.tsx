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
    image: any;
    description: string;
}) {
    return (
        <Card
            bg="#45311D"
            c="white"
            m={30}
            h={407}
            w={312}
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
                    left: 7,
                    top: 9,
                }}
            >
                <SVGBlock />
            </Group>
            <Group
                style={{
                    zIndex: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    color: '#3B2B27'
                }}
            >
                <Title order={2} p={20}>
                    {title}
                </Title>
                <Card.Section>
                    <Image src={image.src} alt={title} width={image.width * 0.4} height={image.height * 0.4} />
                </Card.Section>
                <Text
                    lh={1.25}
                    w={image.width * 0.4}
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
