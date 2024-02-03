"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";

export async function validateTenant(key: string) {
  if (!key) {
    return { valid: false, id: null };
  }
  const response = await fetch(`${apiUrl}tenant/${key}/validate`);
  if (!response.ok) {
    throw new Error("Failed to validate tenant");
  }

  const data = await response.json();

  if (data?.valid) {
    redirect("/dashboard/" + data.id);
  }
  return data;
}

export async function createTenant() {
  const response = await fetch(`${apiUrl}tenant/create`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to create tenant");
  }
  revalidatePath("/login");
  return response.json();
}
