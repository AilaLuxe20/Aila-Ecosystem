import type { UserRole } from "@/types/auth";

declare global {
  /**
   * Custom claims exposed on `sessionClaims` from Clerk's `auth()` / `getAuth()`.
   *
   * Clerk merges this interface into its `JwtPayload`, so the shape here must
   * match the session token customization configured in the Clerk Dashboard:
   * `{ "metadata": "{{user.public_metadata}}" }`
   */
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }
}
