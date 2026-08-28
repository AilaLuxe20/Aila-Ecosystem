import type { Metadata } from "next";

import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Live counts from your Aila products.",
};

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
