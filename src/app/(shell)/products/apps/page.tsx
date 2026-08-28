import type { Metadata } from "next";

import { AppsWorkspace } from "@/components/apps/AppsWorkspace";

export const metadata: Metadata = {
  title: "Aila Apps",
  description: "Register the apps you ship and mark them live when the URL works.",
};

export default function AilaAppsPage() {
  return <AppsWorkspace />;
}
