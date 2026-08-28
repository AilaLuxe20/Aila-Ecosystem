import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canAccess } from "@/lib/auth/can-access";
import type { UserRole } from "@/types/auth";

export async function requireProductAccess(product: string) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (sessionClaims?.metadata?.role as UserRole | undefined) ?? "user";

  if (!canAccess(role, product)) {
    redirect("/");
  }

  return { userId, role };
}
