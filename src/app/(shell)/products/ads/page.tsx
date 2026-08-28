import type { Metadata } from "next";

import { AdsWorkspace } from "@/components/ads/AdsWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Ads",
  description: "Plan, launch, pause, and end advertising campaigns in Aila Ads.",
};

export default async function AilaAdsPage() {
  await requireProductAccess("ads");
  return <AdsWorkspace />;
}
