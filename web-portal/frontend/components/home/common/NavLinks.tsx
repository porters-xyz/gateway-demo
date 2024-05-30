import { Title } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function NavLinks({ size = 18 }: { size?: number }) {
  const router = useRouter();

  return (
    <>
      <Title size={size} fw={700} onClick={() => router.push('/')} style={{cursor: "pointer"}}>
        Home
      </Title>

      <Title size={size} fw={500} onClick={() => router.push('/#pricing')} style={{
        cursor: "pointer"
      }}>
        Pricing
      </Title>

      <Title size={size} fw={500} onClick={() => router.push('/swap')} style={{
        cursor: "pointer"
      }}>
        Swap
      </Title>

      <Title size={size} fw={500} onClick={() => router.replace('https://docs.porters.xyz')} style={{
        cursor: "pointer"
      }}>
        Documentation
      </Title>
    </>
  );
}
