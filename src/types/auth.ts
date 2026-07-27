export type UserRole =
  | "guest"
  | "user"
  | "pro"
  | "business"
  | "enterprise"
  | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
