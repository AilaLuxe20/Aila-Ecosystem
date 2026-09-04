import type { Metadata } from "next";

import { AdsWorkspace } from "@/components/ads/AdsWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Ads",
  description:
    "Plan advertising campaigns, generate ad copy, and analyse stored campaign data. Live network metrics appear only after a real platform connection.",
};

export default async function AilaAdsPage() {
  await requireProductAccess("ads");
  return <AdsWorkspace />;
}
