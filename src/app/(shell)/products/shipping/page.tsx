import type { Metadata } from "next";

import { ShippingWorkspace } from "@/components/shipping/ShippingWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Shipping",
  description:
    "Create shipment records, statuses, and tracking numbers you enter. Carrier live tracking is not connected.",
};

export default async function AilaShippingPage() {
  await requireProductAccess("shipping");
  return <ShippingWorkspace />;
}
