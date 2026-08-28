import { UserRole } from "@/types/auth";

import { PAID_PRODUCT_KEYS, PRODUCT_KEYS } from "@/core/products/catalog";

export const permissions: Record<UserRole, readonly string[]> = {
  guest: [],

  user: ["intelligence"],

  pro: [...PRODUCT_KEYS],

  business: [...PRODUCT_KEYS],

  enterprise: ["*"],

  admin: ["*"],
};

export const PAID_PRODUCTS = PAID_PRODUCT_KEYS;
