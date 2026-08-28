import type { Metadata } from "next";

import { SitesWorkspace } from "@/components/sites/SitesWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Sites",
  description: "Write markdown pages, publish them, and share a public URL.",
};

export default async function AilaSitesPage() {
  await requireProductAccess("sites");
  return <SitesWorkspace />;
}
