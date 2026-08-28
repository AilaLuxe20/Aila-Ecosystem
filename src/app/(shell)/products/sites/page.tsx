import type { Metadata } from "next";

import { SitesWorkspace } from "@/components/sites/SitesWorkspace";

export const metadata: Metadata = {
  title: "Aila Sites",
  description: "Write markdown pages, publish them, and share a public URL.",
};

export default function AilaSitesPage() {
  return <SitesWorkspace />;
}
