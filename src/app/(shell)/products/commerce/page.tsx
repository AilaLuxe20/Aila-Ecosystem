import type { Metadata } from "next";

import { CommerceWorkspace } from "@/components/commerce/CommerceWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Commerce",
  description:
    "Create products and orders in Aila Commerce. Mark orders paid after you receive payment outside Aila.",
};

export default async function AilaCommercePage() {
  await requireProductAccess("commerce");
  return <CommerceWorkspace />;
}
