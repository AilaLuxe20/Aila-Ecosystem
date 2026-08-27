import { getRegisteredTool } from "@/core/ai/orchestrator/tools/registry";

export function resolveTool(id: string) {
  return getRegisteredTool(id);
}
