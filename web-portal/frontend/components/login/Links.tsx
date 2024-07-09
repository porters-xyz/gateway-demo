import { IconArrowUpRight } from "@tabler/icons-react";
import { Flex, Title,  } from "@mantine/core";
import { useRouter } from "next/navigation";
import { crimson } from "@frontend/utils/theme";
export default function CommonLinks(){
  const router = useRouter()
  return (
  <Flex align='center' gap={24} m={20}>
  <Title order={2} onClick={() => router.push('/pricing')} c='carrot' style={{
    cursor: "pointer",
    fontFamily: crimson.style.fontFamily
  }}>
    Pricing
  </Title>

  <Title order={2}  onClick={() => router.push('https://docs.porters.xyz')} c='carrot' style={{
    cursor: "pointer",
    fontFamily: crimson.style.fontFamily
  }}>
    Docs <IconArrowUpRight size={16}/>
  </Title>
  </Flex>
  )
}
