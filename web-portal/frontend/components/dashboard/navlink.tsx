import React from "react";
import { Box } from "@mantine/core";
import { useRouter, usePathname } from "next/navigation";
import { useHover } from "@mantine/hooks";

const NavLink = ({
  link,
  label,
  icon,
}: {
  link: string;
  label: string;
  icon: React.ReactNode;
}) => {
  const router = useRouter();
  const path = usePathname();
  const { hovered, ref } = useHover();
  return (
    <Box
      ref={ref}
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        textDecoration: "none",
        color: "white",
        width: "100%",
        padding: 5,
        borderRadius: 4,
        cursor: "pointer",
        backgroundColor:
          path === link ? "#00000030" : hovered ? "#00000015" : "transparent",
      }}
      onClick={() => router.replace(link)}
    >
      {icon}
      {label}
    </Box>
  );
};
export default NavLink;
