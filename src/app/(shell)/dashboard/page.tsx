import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Live counts from your Aila products.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return <DashboardWorkspace />;
}
