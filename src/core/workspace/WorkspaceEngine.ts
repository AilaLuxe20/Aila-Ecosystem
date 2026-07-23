import { loadProducts } from "@/core/registry/loader";
import type { WorkspaceState } from "./WorkspaceContext";

export function createWorkspace(): WorkspaceState {
    return {
        products: loadProducts(),
        loadedAt: new Date(),
    };
}