import type { Metadata } from "next";

import { TravelWorkspace } from "@/components/travel/TravelWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Travel",
  description: "Plan trips, itineraries, and reservation notes. Aila does not book travel.",
};

export default async function AilaTravelPage() {
  await requireProductAccess("travel");
  return <TravelWorkspace />;
}
