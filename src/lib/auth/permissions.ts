import { UserRole } from "@/types/auth";

export const permissions: Record<UserRole, readonly string[]> = {
  guest: [],

  user: [
    "intelligence",
  ],

  pro: [
    "intelligence",
    "commerce",
    "sites",
    "apps",
    "flow",
    "calendar",
    "ads",
    "automation",
  ],

  business: [
    "intelligence",
    "commerce",
    "sites",
    "apps",
    "flow",
    "calendar",
    "ads",
    "automation",
    "business",
    "ailalegal",
  ],

  enterprise: [
    "*",
  ],

  admin: [
    "*",
  ],
};
