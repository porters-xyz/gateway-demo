import { Box } from "@mantine/core";
import background from "@frontend/public/background.png";
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      style={{ backgroundColor: "#3C2B27", backgroundImage: background.src }}
    >
      {children}
    </Box>
  );
}
