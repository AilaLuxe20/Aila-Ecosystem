import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { resolveProductEntitlement } from "@/core/billing/entitlements";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { productKeyFromMode, PRODUCTS, isProductKey, type ProductKey } from "@/core/products/catalog";
import type { AilaMode } from "@/core/types";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/app-error";
import { parseClerkPublicRole } from "@/lib/auth/role";
import type { UserRole } from "@/types/auth";

export async function getActorRole(): Promise<UserRole | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  return parseClerkPublicRole(sessionClaims?.metadata?.role);
}

export async function requireProductAccess(product: ProductKey) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(PRODUCTS[product].href)}`);
  }

  const role = parseClerkPublicRole(sessionClaims?.metadata?.role);
  const user = await requirePrismaUser();
  const decision = await resolveProductEntitlement(user.id, role, product);

  if (!decision.allowed) {
    redirect(`/billing?product=${product}`);
  }

  return { userId, role, user };
}

export async function assertProductEntitlement(product: ProductKey) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new AuthenticationError();
  }

  const role = parseClerkPublicRole(sessionClaims?.metadata?.role);
  const user = await requirePrismaUser();
  const decision = await resolveProductEntitlement(user.id, role, product);

  if (!decision.allowed) {
    throw new AuthorizationError({
      message: "A Pro subscription is required to use this product.",
      context: { product, reason: decision.reason },
    });
  }

  return user;
}

export async function requireAuthenticatedPrismaUser() {
  try {
    return await requirePrismaUser();
  } catch (error) {
    if (error instanceof AilaAuthenticationError) {
      throw new AuthenticationError({ message: error.message });
    }
    throw error;
  }
}

export async function assertModeEntitlement(mode: AilaMode) {
  return assertProductEntitlement(productKeyFromMode(mode));
}

export function parseProductQuery(value: string | null): ProductKey | null {
  if (!value) return null;
  return isProductKey(value) ? value : null;
}
