import type { Metadata } from "next";

import { CodingWorkspace } from "@/components/coding/CodingWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Coding",
  description: "Edit project files on your account and ask Aila to explain them.",
};

export default async function AilaCodingPage() {
  await requireProductAccess("coding");
  return <CodingWorkspace />;
}
