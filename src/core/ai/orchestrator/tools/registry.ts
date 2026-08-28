import type { ExecutionPlan } from "../planner/planner";
import { analyzeDataTool } from "./analyze-data";
import { analyzeTextTool } from "./analyze-text";
import { calculatorTool } from "./calculator-tool";
import { webResearchTool } from "./web-research";
import {
  isIntelligenceToolName,
  type IntelligenceToolName,
} from "./contract";

export interface AilaTool {
  id: string;
  name: string;
  enabled: boolean;
}

const registeredTools = [
  webResearchTool,
  analyzeTextTool,
  analyzeDataTool,
  calculatorTool,
];

const toolsByName = new Map(
  registeredTools.map((tool) => [tool.name, tool])
);

export function listRegisteredTools() {
  return [...registeredTools];
}

export function getRegisteredTool(name: string) {
  if (!isIntelligenceToolName(name)) {
    return undefined;
  }
  return toolsByName.get(name as IntelligenceToolName);
}

export function getAvailableTools(): AilaTool[] {
  return listRegisteredTools().map((tool) => ({
    id: tool.name,
    name: tool.name,
    enabled: true,
  }));
}

export function resolveTools(plan: ExecutionPlan): AilaTool[] {
  const available = getAvailableTools();

  switch (plan.route) {
    case "document":
      return available.filter((tool) => tool.id === "analyze_text");
    default:
      return available;
  }
}
