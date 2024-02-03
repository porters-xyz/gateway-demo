import { Suspense } from "react";

const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";
// TODO- setup a central const and their validation file

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
        <div>{JSON.stringify(tenant)}</div>
      </Suspense>
    </>
  );
}
