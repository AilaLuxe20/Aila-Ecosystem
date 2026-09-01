import type { Metadata } from "next";

import { IntelligenceExperience } from "@/components/intelligence/IntelligenceExperience";

export const metadata: Metadata = {
  title: "Aila Intelligence",
  description:
    "Chat with Aila, attach files, and persist conversations on your account.",
  alternates: {
    canonical: "/products/intelligence",
  },
};

export default function AilaIntelligencePage() {
  return <IntelligenceExperience />;
}
