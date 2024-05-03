import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { useViewportSize } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";

export default function CreateAppButton() {
  const router = useRouter();
  const path = usePathname();
  const { width } = useViewportSize();
  const isMobile = width < 600;
  return (
    <Button onClick={() => router.replace(path + "?new=app")} w="max-content">
      {isMobile && <IconPlus />}
      {!isMobile ? "CreateApp" : null}
    </Button>
  );
}
