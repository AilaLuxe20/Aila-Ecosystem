/**
 * Aila Workflows Core
 *
 * Workflow engine for the Aila Ecosystem.
 * Provides workflow definition, execution, and
 * orchestration capabilities across all products.
 */

export type WorkflowStatus = "draft" | "active" | "paused" | "completed" | "archived";

export type WorkflowTrigger =
  | "manual"
  | "scheduled"
  | "webhook"
  | "event"
  | "ai"
  | "cron";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "transform" | "ai";
  name: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  productId: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  input: unknown;
  output?: unknown;
  logs: WorkflowLog[];
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowLog {
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  nodeId?: string;
}

export const WORKFLOW_TRIGGERS: WorkflowTrigger[] = [
  "manual",
  "scheduled",
  "webhook",
  "event",
  "ai",
  "cron",
];

export const WORKFLOW_STATUSES: WorkflowStatus[] = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
];
