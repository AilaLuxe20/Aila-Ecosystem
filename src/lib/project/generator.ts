import { GeneratedProject } from "./types";
import { nextTemplates } from "./nextTemplates";

export function createProject(
  name: string,
  description: string
): GeneratedProject {

  return {
    id: crypto.randomUUID(),

    name,

    description,

    framework: "Next.js 16",

    createdAt: new Date().toISOString(),

    files: [
      {
        path: "app/page.tsx",
        content: nextTemplates.page,
      },
      {
        path: "app/layout.tsx",
        content: nextTemplates.layout,
      },
      {
        path: "components/Navbar.tsx",
        content: nextTemplates.navbar,
      },
      {
        path: "components/Hero.tsx",
        content: nextTemplates.hero,
      },
      {
        path: "components/Footer.tsx",
        content: nextTemplates.footer,
      },
    ],
  };
}
