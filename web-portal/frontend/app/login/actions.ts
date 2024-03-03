"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiUrl } from "@frontend/utils/consts";

export async function recoverTenant(key: string) {
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
