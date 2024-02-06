"use server";
import { redirect } from "next/navigation";

const apiUrl = process.env.API_ENDPOINT || "http://localhost:4000/";

export async function createApp(tenantId: string) {
  if (!tenantId) {
    return redirect("/login");
  }

  const response = await fetch(`${apiUrl}tenant/${tenantId}/authkey`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create an app for the tenant");
  }

  return response.json();
}
