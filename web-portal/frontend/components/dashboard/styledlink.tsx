import React from "react";
import { Text } from "@mantine/core";
import Link from "next/link";

const StyledLink = ({
  children,
  link,
}: {
  children: React.ReactNode;
  link: string;
}) => {
  return (
    <Text size="sm" fw={500} c="dimmed">
      <Link
        href={link}
        style={{
          display: "flex",
          textDecoration: "none",
          alignItems: "center",
          color: "grey",
        }}
      >
        {children}
      </Link>
    </Text>
  );
};

export default StyledLink;
