import React from "react";
import { useSearchParams } from "next/navigation";
import { Button, PasswordInput } from "@mantine/core";

export default function SecretKeyForm() {
  const searchParams = useSearchParams();

  // TODO- work on this

  return (
    <React.Fragment>
      <PasswordInput
        label="Your Secret Key"
        value={searchParams?.get("key") as string}
        readOnly
      />

      <Button fullWidth style={{ marginTop: 32 }}>
        Create New Secret Key
      </Button>
    </React.Fragment>
  );
}
