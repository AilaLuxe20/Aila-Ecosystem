/**
 * Aila API Platform Core
 *
 * API management and gateway system for the Aila Ecosystem.
 * Provides API definition, authentication, rate limiting,
 * and cross-product API orchestration.
 */

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiAuthType = "none" | "apiKey" | "oauth" | "jwt" | "service-account";

export interface ApiEndpoint {
  id: string;
  productId: string;
  path: string;
  method: ApiMethod;
  description: string;
  authType: ApiAuthType;
  parameters: ApiParameter[];
  responses: ApiResponse[];
  rateLimit?: number;
  version: string;
  deprecated: boolean;
}

export interface ApiParameter {
  name: string;
  location: "query" | "path" | "header" | "body";
  type: string;
  required: boolean;
  description: string;
  default?: unknown;
}

export interface ApiResponse {
  statusCode: number;
  description: string;
  schema?: Record<string, unknown>;
}

export interface ApiSpec {
  productId: string;
  name: string;
  version: string;
  baseUrl: string;
  endpoints: ApiEndpoint[];
  schemas: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiGatewayConfig {
  productId: string;
  apiKey: string;
  rateLimit: number;
  corsOrigins: string[];
  timeout: number;
  retries: number;
}

export const API_METHODS: ApiMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const API_AUTH_TYPES: ApiAuthType[] = [
  "none",
  "apiKey",
  "oauth",
  "jwt",
  "service-account",
];

export function createApiSpec(
  productId: string,
  name: string,
  version: string,
  baseUrl: string
): ApiSpec {
  return {
    productId,
    name,
    version,
    baseUrl,
    endpoints: [],
    schemas: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
