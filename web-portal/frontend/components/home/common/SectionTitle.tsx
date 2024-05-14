import Image from "next/image";
import { Stack, Flex, Title } from "@mantine/core";
import { redRose } from "@frontend/utils/theme";
import medievalDecor from "@frontend/public/medieval-decor.png";
export default function SectionTitle({ title }: { title: string }) {
    return (
        <Stack align="center">
            <Flex align="center" gap={20}>
                <Image
                    src={medievalDecor.src}
                    alt="svg"
                    width={32}
                    height={48}
                />
                <Title
                    style={{
                        fontFamily: redRose.style.fontFamily,
                        fontWeight: 600,
                        fontSize: 40,
                        textAlign: 'center'
                    }}
                >
                    {title}
                </Title>
                <Image
                    src={medievalDecor.src}
                    alt="svg"
                    width={32}
                    height={48}
                    style={{
                        transform: `rotate(180deg)`,
                    }}
                />
            </Flex>
        </Stack>
    );
}
