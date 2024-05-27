import { Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useViewportSize } from "@mantine/hooks";
import { signOut } from "@frontend/utils/siwe";

export default function LogoutButton() {
  const { width } = useViewportSize();
  const isMobile = width < 600;

  return (
    <Button onClick={signOut} variant="outline" color="#856853" w="max-content">
      {isMobile && <IconLogout />}
      {!isMobile ? "Logout" : null}
    </Button>
  );
}
