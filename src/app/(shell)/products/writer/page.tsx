import type { Metadata } from "next";

import { WriterWorkspace } from "@/components/writer/WriterWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Writer",
  description: "Develop a book from idea to manuscript with characters, bible, chapters, and revision.",
};

export default async function AilaWriterPage() {
  await requireProductAccess("writer");
  return <WriterWorkspace />;
}
