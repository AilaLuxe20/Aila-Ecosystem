/**
 * Aila Agents Core
 *
 * Autonomous AI agent framework for the Aila Ecosystem.
 * Provides agent lifecycle management, task execution,
 * and multi-agent orchestration capabilities.
 */

export type AgentStatus = "idle" | "running" | "completed" | "failed" | "paused";

export type AgentCapability =
  | "reasoning"
  | "planning"
  | "tool-use"
  | "communication"
  | "analysis"
  | "automation"
  | "search"
  | "knowledge";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  productId: string;
  capabilities: AgentCapability[];
  model: string;
  maxSteps: number;
  temperature: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  context: Record<string, unknown>;
  status: AgentStatus;
  result?: unknown;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentExecution {
  agentId: string;
  taskId: string;
  steps: AgentStep[];
  status: AgentStatus;
  result?: unknown;
}

export interface AgentStep {
  step: number;
  action: string;
  input: unknown;
  output?: unknown;
  timestamp: Date;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  "reasoning",
  "planning",
  "tool-use",
  "communication",
  "analysis",
  "automation",
  "search",
  "knowledge",
];

export function createAgentDefinition(
  def: Partial<AgentDefinition> & Pick<AgentDefinition, "id" | "name" | "productId">
): AgentDefinition {
  return {
    description: "",
    capabilities: [],
    model: "google/gemini-2.0-pro-exp-02-05",
    maxSteps: 10,
    temperature: 0.7,
    ...def,
  };
}
