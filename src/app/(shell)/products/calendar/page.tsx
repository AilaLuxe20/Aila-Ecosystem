import type { Metadata } from "next";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";

export const metadata: Metadata = {
  title: "Aila Calendar",
  description:
    "Create, view, search, edit, archive, and delete your events in Aila Calendar.",
};

export default function AilaCalendarPage() {
  return <CalendarWorkspace />;
}
