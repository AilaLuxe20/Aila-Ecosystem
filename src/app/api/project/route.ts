import { NextResponse } from "next/server";
import { createProject } from "@/lib/project/generator";
import { templates } from "@/lib/project/templates";

export async function POST(req: Request) {
  const { name, description } = await req.json();

  const project = createProject(name, description);

  project.files.push(
    {
      path: "app/page.tsx",
      content: templates.page,
    },
    {
      path: "app/layout.tsx",
      content: templates.layout,
    }
  );

  return NextResponse.json(project);
}
