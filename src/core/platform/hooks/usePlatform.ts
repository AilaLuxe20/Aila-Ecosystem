"use client";

/**
 * usePlatform Hook
 *
 * Provides a unified interface to the Aila platform context,
 * integrating with the Command Center, workspace management,
 * and product navigation.
 *
 * This hook wraps the PlatformContext and adds convenience
 * methods for common platform operations.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { usePlatformContext } from "../providers/PlatformProvider";
import { commandRegistry } from "@/core/command-center/CommandRegistry";
import { products } from "@/config/products";
import type { Product } from "@/config/products";

export function usePlatform() {
  const context = usePlatformContext();
  const router = useRouter();

  const { state, openWorkspace, closeWorkspace, setActiveWorkspace } =
    context;

  /** Navigate to a product route */
  const navigateToProduct = useCallback(
    (product: Product) => {
      openWorkspace(product.href);
      router.push(product.href);
    },
    [openWorkspace, router]
  );

  /** Navigate to a custom route */
  const navigateTo = useCallback(
    (route: string) => {
      openWorkspace(route);
      router.push(route);
    },
    [openWorkspace, router]
  );

  /** Open the product launcher */
  const openLauncher = useCallback(() => {
    context.openLauncher();
  }, [context]);

  /** Close the product launcher */
  const closeLauncher = useCallback(() => {
    context.closeLauncher();
  }, [context]);

  /** Open the global search */
  const openSearch = useCallback(() => {
    context.openSearch();
  }, [context]);

  /** Close the global search */
  const closeSearch = useCallback(() => {
    context.closeSearch();
  }, [context]);

  /** Execute a command by id */
  const executeCommand = useCallback(
    async (id: string) => {
      await commandRegistry.execute(id);
    },
    []
  );

  /** Get all registered commands */
  const getCommands = useCallback(() => {
    return commandRegistry.getAll();
  }, []);

  /** Search commands */
  const searchCommands = useCallback((query: string) => {
    return commandRegistry.search(query);
  }, []);

  /** Get all products */
  const getAllProducts = useCallback(() => {
    return products;
  }, []);

  /** Get live products */
  const getLiveProducts = useCallback(() => {
    return products.filter((p) => p.status === "live");
  }, []);

  /** Get building products */
  const getBuildingProducts = useCallback(() => {
    return products.filter((p) => p.status === "building");
  }, []);

  return {
    // State
    state,
    workspaces: state.workspaces,
    activeWorkspace: state.activeWorkspace,
    launcherOpen: state.launcherOpen,
    searchOpen: state.searchOpen,

    // Workspace actions
    openWorkspace,
    closeWorkspace,
    setActiveWorkspace,

    // Navigation
    navigateToProduct,
    navigateTo,

    // Launcher
    openLauncher,
    closeLauncher,

    // Search
    openSearch,
    closeSearch,

    // Command Center
    executeCommand,
    getCommands,
    searchCommands,

    // Products
    getAllProducts,
    getLiveProducts,
    getBuildingProducts,
  };
}
