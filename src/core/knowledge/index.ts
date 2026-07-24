/**
 * Aila Knowledge Core
 *
 * Knowledge management system for the Aila Ecosystem.
 * Provides knowledge base management, semantic search,
 * and knowledge graph capabilities.
 */

export type KnowledgeNodeType =
  | "concept"
  | "entity"
  | "document"
  | "faq"
  | "procedure"
  | "policy"
  | "reference";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  title: string;
  content: string;
  productId: string;
  tags: string[];
  embedding?: number[];
  relatedNodes: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface KnowledgeRelation {
  sourceNodeId: string;
  targetNodeId: string;
  relationType: "references" | "depends-on" | "related-to" | "derived-from";
  strength: number;
}

export interface KnowledgeBase {
  id: string;
  productId: string;
  name: string;
  description: string;
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeQuery {
  query: string;
  productId?: string;
  nodeTypes?: KnowledgeNodeType[];
  tags?: string[];
  limit?: number;
}

export const KNOWLEDGE_NODE_TYPES: KnowledgeNodeType[] = [
  "concept",
  "entity",
  "document",
  "faq",
  "procedure",
  "policy",
  "reference",
];

export const KNOWLEDGE_RELATION_TYPES = [
  "references",
  "depends-on",
  "related-to",
  "derived-from",
] as const;
