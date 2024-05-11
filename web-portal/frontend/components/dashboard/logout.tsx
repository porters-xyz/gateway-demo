import { Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useDisconnect } from "wagmi";
import { useViewportSize } from "@mantine/hooks";

export default function LogoutButton() {
  const { disconnect } = useDisconnect();
  const { width } = useViewportSize();
  const isMobile = width < 600;
  return (
    <Button
      onClick={() => disconnect()}
      variant="outline"
      color="umbra.1"
      w="max-content"
    >
      {isMobile && <IconLogout />}
      {!isMobile ? "Logout" : null}
    </Button>
  );
}
