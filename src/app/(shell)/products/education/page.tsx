import type { Metadata } from "next";

import { EducationWorkspace } from "@/components/education/EducationWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Education",
  description: "Study with courses, notes, and quizzes stored on your account.",
};

export default async function AilaEducationPage() {
  await requireProductAccess("education");
  return <EducationWorkspace />;
}
