import type { ReactNode } from "react";

import { requireProductAccess } from "@/lib/auth/require-product-access";

export default async function AilaLegalLayout({ children }: { children: ReactNode }) {
  await requireProductAccess("ailalegal");
  return children;
}
