/**
 * Aila Search Core
 *
 * Unified search infrastructure for the Aila Ecosystem.
 * Provides cross-product search, indexing, and
 * result ranking capabilities.
 */

export type SearchResultType =
  | "product"
  | "page"
  | "document"
  | "agent"
  | "workflow"
  | "widget"
  | "knowledge";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  productId: string;
  score: number;
  highlights?: string[];
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilter;
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "score";
}

export interface SearchFilter {
  productIds?: string[];
  types?: SearchResultType[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchIndex {
  productId: string;
  type: SearchResultType;
  entries: SearchEntry[];
}

export interface SearchEntry {
  id: string;
  title: string;
  content: string;
  url: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export const SEARCH_RESULT_TYPES: SearchResultType[] = [
  "product",
  "page",
  "document",
  "agent",
  "workflow",
  "widget",
  "knowledge",
];

export function createSearchQuery(
  query: string,
  options: Partial<SearchQuery> = {}
): SearchQuery {
  return {
    query,
    limit: 20,
    offset: 0,
    sortBy: "relevance",
    ...options,
  };
}
