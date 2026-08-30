import type { Metadata } from "next";

import { WriterWorkspace } from "@/components/writer/WriterWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Writer",
  description: "Write, edit, and rewrite documents stored on your account.",
};

export default async function AilaWriterPage() {
  await requireProductAccess("writer");
  return <WriterWorkspace />;
}
