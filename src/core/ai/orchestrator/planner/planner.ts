import type { AilaIntent } from "../intent/detect";

export interface ExecutionPlan {
  intent: AilaIntent;
  route: string;
  useMemory: boolean;
  useDocuments: boolean;
  useTools: boolean;
}

export function createPlan(intent: AilaIntent): ExecutionPlan {
  switch (intent) {
    case "legal":
      return {
        intent,
        route: "legal",
        useMemory: true,
        useDocuments: true,
        useTools: true,
      };

    case "document":
      return {
        intent,
        route: "document",
        useMemory: true,
        useDocuments: true,
        useTools: true,
      };

    case "business":
      return {
        intent,
        route: "business",
        useMemory: true,
        useDocuments: false,
        useTools: true,
      };

    case "automation":
      return {
        intent,
        route: "automation",
        useMemory: true,
        useDocuments: false,
        useTools: true,
      };

    case "planning":
      return {
        intent,
        route: "planning",
        useMemory: true,
        useDocuments: true,
        useTools: true,
      };

    default:
      return {
        intent: "chat",
        route: "chat",
        useMemory: true,
        useDocuments: false,
        useTools: false,
      };
  }
}
