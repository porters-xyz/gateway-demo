import { Button } from "@mantine/core";
import { signOut } from "@frontend/utils/siwe";
import { useDisconnect } from "wagmi";
export default function LogoutButton() {
  const { disconnect } = useDisconnect();
  return (
    <>
      <form
        onSubmit={async () => {
          disconnect();
          signOut();
        }}
      >
        <Button type="submit" variant="outline" color="umbra.1">
          Logout
        </Button>
      </form>
    </>
  );
}
