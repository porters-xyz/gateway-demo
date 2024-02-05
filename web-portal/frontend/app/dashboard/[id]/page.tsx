import AppList from "./applist.component";
import NewAppModal from "./modal.component";
import { Suspense } from "react";
import { Container, Flex, Button, Title } from "@mantine/core";
import { IApp } from "@frontend/utils/types";
import Link from "next/link";

const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";
// TODO- setup a central const and their validation file

// TODO- Get actual API keys from db

const List: Array<IApp> = [
  {
    id: "ashukjs",
    name: "App Name 1",
    status: "Active",
    createdAt: new Date().toLocaleDateString(),
  },
  {
    id: "sasjd",
    name: "App Name 2",
    status: "Inactive",
    createdAt: new Date().toLocaleDateString(),
  },
];

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
  // const keys = await getKeys(id);

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
            <Title order={5}>Tenant id: {tenant.id}</Title>
            <Link href="?new=app">
              <Button> New App</Button>
            </Link>
          </Flex>
          <AppList list={List} />
        </Container>
      </Suspense>
    </>
  );
}
