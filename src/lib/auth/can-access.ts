import { permissions } from "./permissions";
import { UserRole } from "@/types/auth";

export function canAccess(
  role: UserRole,
  product: string
): boolean {
  const allowed = permissions[role] as readonly string[];

  return allowed.includes("*") || allowed.includes(product);
}
