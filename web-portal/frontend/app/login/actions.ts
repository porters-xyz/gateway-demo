"use server";

export async function validateTenant(key: string) {
  const response = await fetch("http://localhost:4000/tenant/validate/" + key);
  if (!response.ok) {
    throw new Error("Failed to validate tenant");
  }
  return response.json();
}

export async function createTenant() {
  const response = await fetch("http://localhost:4000/tenant/create");
  if (!response.ok) {
    throw new Error("Failed to create tenant");
  }

  return response.json();
}
