"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";

export async function validateTenant(key: string) {
  if (!key) {
    return { valid: false, id: null };
  }
  const response = await fetch(`${apiUrl}tenant?key=${key}`);
  if (!response.ok) {
    throw new Error("Failed to validate tenant");
  }

  const data = await response.json();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  if (data?.valid) {
    cookies().set("tenant", data?.id, { expires });
    redirect("/dashboard/");
  }
  return data;
}

export async function createTenant() {
  const response = await fetch(`${apiUrl}tenant/`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to create tenant");
  }

  const data = await response.json();

  redirect("/login?secret=" + data?.secret);

  return data;
}
