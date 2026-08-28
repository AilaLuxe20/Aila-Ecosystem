import type { Metadata } from "next";

import { AdsWorkspace } from "@/components/ads/AdsWorkspace";

export const metadata: Metadata = {
  title: "Aila Ads",
  description: "Plan, launch, pause, and end advertising campaigns in Aila Ads.",
};

export default function AilaAdsPage() {
  return <AdsWorkspace />;
}
