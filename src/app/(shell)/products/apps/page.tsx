import type { Metadata } from "next";

import { AppsWorkspace } from "@/components/apps/AppsWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Apps",
  description: "Register the apps you ship and mark them live when the URL works.",
};

export default async function AilaAppsPage() {
  await requireProductAccess("apps");
  return <AppsWorkspace />;
}
