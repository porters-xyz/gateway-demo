"use server";
import { revalidatePath } from "next/cache";

export async function validateTenant(key: string) {
  if (!key) {
    return { valid: false, id: null };
  }
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
  revalidatePath("/login");
  return response.json();
}
