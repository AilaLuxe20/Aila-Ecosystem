import { runRegisteredTool } from "@/core/ai/orchestrator/tools/execute";
import type { ToolContext } from "@/core/ai/orchestrator/tools/contract";

export async function executeTool(
  id: string,
  input: unknown,
  context?: ToolContext
) {
  return runRegisteredTool(
    id,
    input,
    context ?? {
      userId: "",
      mode: "intelligence",
    }
  );
}
