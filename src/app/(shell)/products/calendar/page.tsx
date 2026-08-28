import type { Metadata } from "next";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { requireProductAccess } from "@/lib/auth/require-product-access";

export const metadata: Metadata = {
  title: "Aila Calendar",
  description:
    "Create, view, search, edit, archive, and delete your events in Aila Calendar.",
};

export default async function AilaCalendarPage() {
  await requireProductAccess("calendar");
  return <CalendarWorkspace />;
}
