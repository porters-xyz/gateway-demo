import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Container, Flex, Button, Title } from "@mantine/core";
import Link from "next/link";

const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";
// TODO: setup a central const and their validation file

async function getTenant(id: string) {
  const response = await fetch(`${apiUrl}tenant/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch tenant");
  }

  return response.json();
}

export default async function User({ params }: { params: { id: string } }) {
  const { id } = params;
  const tenant = await getTenant(id);

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
          <NewAppModal id={id} />
          <Flex
            justify={"space-between"}
            align={"center"}
            style={{ marginBottom: 20 }}
          >
            <Title order={5}>Tenant id: {tenant.id}</Title>
            <Link href="?new=app">
              <Button> New App</Button>
            </Link>
          </Flex>
          <AppList list={tenant.keys} />
        </Container>
      </Suspense>
    </>
  );
}
