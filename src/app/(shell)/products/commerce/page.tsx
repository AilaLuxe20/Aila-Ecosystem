import type { Metadata } from "next";

import { CommerceWorkspace } from "@/components/commerce/CommerceWorkspace";

export const metadata: Metadata = {
  title: "Aila Commerce",
  description: "Create products, take orders, and collect payment in Aila Commerce.",
};

export default function AilaCommercePage() {
  return <CommerceWorkspace />;
}
