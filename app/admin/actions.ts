"use server";

import { redirect } from "next/navigation";

import { endSession } from "@/lib/admin/session";

/** Signs out of the Admin (a POST, so no link or image can trigger it). */
export async function signOut() {
  await endSession();
  redirect("/admin");
}
