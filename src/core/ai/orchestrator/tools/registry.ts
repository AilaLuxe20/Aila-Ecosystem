import type { ExecutionPlan } from "../planner/planner";

export interface AilaTool {
  id: string;
  name: string;
  enabled: boolean;
}

const tools: AilaTool[] = [
  {
    id: "chat",
    name: "General Chat",
    enabled: true,
  },
  {
    id: "documents",
    name: "Document Intelligence",
    enabled: true,
  },
  {
    id: "legal",
    name: "Legal Analysis",
    enabled: true,
  },
  {
    id: "business",
    name: "Business Intelligence",
    enabled: true,
  },
  {
    id: "automation",
    name: "Workflow Automation",
    enabled: true,
  },
];

export function getAvailableTools(): AilaTool[] {
  return tools.filter((tool) => tool.enabled);
}

export function resolveTools(plan: ExecutionPlan): AilaTool[] {
  return getAvailableTools().filter((tool) => {
    switch (plan.route) {
      case "legal":
        return tool.id === "legal" || tool.id === "documents";

      case "document":
        return tool.id === "documents";

      case "business":
        return tool.id === "business";

      case "automation":
        return tool.id === "automation";

      default:
        return tool.id === "chat";
    }
  });
}
