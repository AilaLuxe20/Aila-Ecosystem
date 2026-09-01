import type { Metadata } from "next";

import { LegalExperience } from "@/components/legal/LegalExperience";

export const metadata: Metadata = {
  title: "Aila Legal",
  description:
    "Upload legal documents for AI analysis stored on your account. Aila Legal is not a substitute for qualified legal advice.",
  alternates: {
    canonical: "/products/ailalegal",
  },
};

export default function AilaLegalPage() {
  return <LegalExperience />;
}
