import { Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useDisconnect } from "wagmi";
import { useViewportSize } from "@mantine/hooks";

export default function LogoutButton() {
  const { disconnectAsync } = useDisconnect();

  const { width } = useViewportSize();
  const isMobile = width < 600;

  return (
    <Button
      onClick={() => disconnectAsync()}
      variant="outline"
      color="#856853"
      w="max-content"
    >
      {isMobile && <IconLogout />}
      {!isMobile ? "Logout" : null}
    </Button>
  );
}
