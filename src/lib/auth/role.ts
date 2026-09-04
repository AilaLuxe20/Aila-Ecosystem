import type { UserRole } from "@/types/auth";

const USER_ROLES: readonly UserRole[] = [
  "guest",
  "user",
  "pro",
  "business",
  "enterprise",
  "admin",
];

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

/**
 * Maps Clerk `public_metadata.role` onto Aila roles.
 *
 * Clerk's sample user and org defaults use `"member"`. Signed-in sessions
 * must not keep that value (or `"guest"`).
 */
export function parseClerkPublicRole(value: unknown): UserRole {
  if (typeof value === "string" && isUserRole(value) && value !== "guest") {
    return value;
  }

  return "user";
}
