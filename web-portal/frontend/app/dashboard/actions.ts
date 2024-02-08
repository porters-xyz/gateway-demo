"use server";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiUrl } from "@frontend/utils/consts";

export async function createApp() {
  const tenantId = cookies().get("tenant")?.value;

  if (!tenantId) {
    return redirect("/login");
  }

  const response = await fetch(`${apiUrl}tenant/${tenantId}/authkey`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to create an app for the tenant");
  }

  revalidatePath("/dashboard/");

  redirect("/dashboard?new=app&key=" + (await response.json()).secretKey);
}

export async function getTenant() {
  const id = cookies().get("tenant")?.value;

  if (!id) {
    redirect("/login");
  }

  const response = await fetch(`${apiUrl}tenant/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch tenant");
  }
  return response.json();
}
