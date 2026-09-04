import type { Metadata } from "next";

import { DocumentsWorkspace } from "@/components/documents/DocumentsWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Documents",
  description: "Upload files, extract text, search, and keep notes on your documents.",
};

export default async function AilaDocumentsPage() {
  await requireProductAccess("documents");
  return <DocumentsWorkspace />;
}
