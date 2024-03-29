import { Button } from "@mantine/core";
import { useDisconnect } from "wagmi";

export default function LogoutButton() {
  const { disconnect } = useDisconnect();
  return (
    <Button onClick={() => disconnect()} variant="outline" color="umbra.1">
      Logout
    </Button>
  );
}
