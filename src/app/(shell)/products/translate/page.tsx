import type { Metadata } from "next";

import { TranslateWorkspace } from "@/components/translate/TranslateWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Translate",
  description: "Translate text between languages and keep a private history.",
};

export default async function AilaTranslatePage() {
  await requireProductAccess("translate");
  return <TranslateWorkspace />;
}
