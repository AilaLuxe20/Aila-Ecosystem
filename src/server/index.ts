/**
 * Barrel export for the server architecture.
 *
 * Import only from server components, route handlers, and server actions —
 * this module pulls in server-only dependencies.
 */

export * from "./core/domain";
export * from "./core/mapper";
export * from "./core/repository";
export * from "./core/service";
export * from "./http/context";
export * from "./http/handler";
export * from "./http/responses";
