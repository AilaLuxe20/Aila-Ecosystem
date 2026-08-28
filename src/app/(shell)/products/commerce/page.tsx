import type { Metadata } from "next";

import { CommerceWorkspace } from "@/components/commerce/CommerceWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Commerce",
  description: "Create products, take orders, and collect payment in Aila Commerce.",
};

export default async function AilaCommercePage() {
  await requireProductAccess("commerce");
  return <CommerceWorkspace />;
}
