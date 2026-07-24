/**
 * Aila Product Registry Core
 *
 * Central product registration and discovery system
 * for the Aila Ecosystem. Manages product manifests,
 * metadata, and cross-product relationships.
 */

import { ProductManifest } from "../products/ProductManifest";

export interface ProductMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  dependencies: string[];
  capabilities: string[];
  icon: string;
  color: string;
  route: string;
  status: "live" | "building" | "system";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRegistration {
  manifest: ProductManifest;
  metadata: ProductMetadata;
  navigation: ProductNavigationRegistration;
  workspace: ProductWorkspaceRegistration;
  route: ProductRouteRegistration;
}

export interface ProductNavigationRegistration {
  id: string;
  label: string;
  href: string;
  icon: string;
  parentId?: string;
  order: number;
  visible: boolean;
}

export interface ProductWorkspaceRegistration {
  id: string;
  productId: string;
  title: string;
  description: string;
  route: string;
  widgets: string[];
  navigation: ProductNavigationItem[];
}

export interface ProductNavigationItem {
  label: string;
  href: string;
  icon?: string;
}

export interface ProductRouteRegistration {
  productId: string;
  route: string;
  pageComponent: string;
  layout?: string;
  middleware?: string[];
}

export class ProductRegistry {
  private registrations: Map<string, ProductRegistration> = new Map();

  register(registration: ProductRegistration): void {
    this.registrations.set(registration.manifest.id, registration);
  }

  unregister(productId: string): boolean {
    return this.registrations.delete(productId);
  }

  get(productId: string): ProductRegistration | undefined {
    return this.registrations.get(productId);
  }

  getAll(): ProductRegistration[] {
    return Array.from(this.registrations.values());
  }

  getLive(): ProductRegistration[] {
    return this.getAll().filter(
      (r) => r.metadata.status === "live"
    );
  }

  getBuilding(): ProductRegistration[] {
    return this.getAll().filter(
      (r) => r.metadata.status === "building"
    );
  }

  getByCategory(category: string): ProductRegistration[] {
    return this.getAll().filter(
      (r) => r.metadata.category === category
    );
  }

  has(productId: string): boolean {
    return this.registrations.has(productId);
  }
}

export const productRegistry = new ProductRegistry();

export function registerProduct(registration: ProductRegistration): void {
  productRegistry.register(registration);
}

export function getProductRegistration(
  productId: string
): ProductRegistration | undefined {
  return productRegistry.get(productId);
}

export function getAllProductRegistrations(): ProductRegistration[] {
  return productRegistry.getAll();
}
