import type { Metadata } from "next";

import { CareerWorkspace } from "@/components/career/CareerWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Career",
  description: "Edit resumes and track job applications stored on your account.",
};

export default async function AilaCareerPage() {
  await requireProductAccess("career");
  return <CareerWorkspace />;
}
