import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Container, Flex, Button, Title } from "@mantine/core";
import Link from "next/link";
import { getTenant } from "./actions";

export default async function User() {
  const tenant = await getTenant();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Container
          style={{
            height: "100vh",
            maxWidth: "900px",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 8,
            paddingTop: 200,
          }}
        >
          <NewAppModal />
          <Flex
            justify={"space-between"}
            align={"center"}
            style={{ marginBottom: 20 }}
          >
            <Title order={5}>logged in as: {tenant?.id}</Title>
            <Link href="?new=app">
              <Button> New App</Button>
            </Link>
          </Flex>
          <AppList list={tenant?.keys} />
        </Container>
      </Suspense>
    </>
  );
}
