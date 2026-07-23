"use client";

import { createContext } from "react";
import type { ProductDefinition } from "@/core/registry/products";

export interface WorkspaceState {
    products: ProductDefinition[];
    loadedAt: Date;
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null);