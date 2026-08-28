import { UserRole } from "@/types/auth";

export const permissions: Record<UserRole, readonly string[]> = {
  guest: [],

  user: [
    "intelligence",
    "ailalegal",
    "business",
    "automation",
    "commerce",
    "ads",
    "calendar",
    "sites",
    "apps",
    "flow",
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
