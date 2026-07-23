/**
 * Default Commands
 *
 * Registers the built-in commands that ship with the Aila
 * Command Center. These commands integrate with the existing
 * platform navigation, AI orb, and product registry.
 */

import { commandRegistry } from "./CommandRegistry";
import type { Command } from "./types";

const commands: Command[] = [
  {
    id: "nav.dashboard",
    label: "Go to Dashboard",
    description: "Open the Aila dashboard",
    category: "navigation",
    icon: "🏠",
    shortcut: "G D",
    execute: () => {
      window.location.href = "/dashboard";
    },
  },
  {
    id: "nav.intelligence",
    label: "Open Aila Intelligence",
    description: "Go to the intelligence workspace",
    category: "product",
    icon: "🧠",
    execute: () => {
      window.location.href = "/products/intelligence";
    },
  },
  {
    id: "nav.legal",
    label: "Open AilaLegal AI",
    description: "Go to the legal intelligence workspace",
    category: "product",
    icon: "⚖️",
    execute: () => {
      window.location.href = "/products/ailalegal";
    },
  },
  {
    id: "nav.business",
    label: "Open Aila Business",
    description: "Go to the business intelligence workspace",
    category: "product",
    icon: "💼",
    execute: () => {
      window.location.href = "/products/business";
    },
  },
  {
    id: "nav.automation",
    label: "Open Aila Automation",
    description: "Go to the workflow automation platform",
    category: "product",
    icon: "🤖",
    execute: () => {
      window.location.href = "/products/automation";
    },
  },
  {
    id: "nav.command-center",
    label: "Open Command Center",
    description: "Go to the central control panel",
    category: "system",
    icon: "🎛️",
    shortcut: "G C",
    execute: () => {
      window.location.href = "/command-center";
    },
  },
  {
    id: "ai.open-orb",
    label: "Open AI Assistant",
    description: "Toggle the Aila AI orb",
    category: "ai",
    icon: "✨",
    shortcut: "Space",
    execute: () => {
      const event = new CustomEvent("aila:toggleOrb");
      window.dispatchEvent(event);
    },
  },
  {
    id: "ai.new-conversation",
    label: "New AI Conversation",
    description: "Start a fresh conversation with Aila",
    category: "ai",
    icon: "💬",
    execute: () => {
      const event = new CustomEvent("aila:newConversation");
      window.dispatchEvent(event);
    },
  },
  {
    id: "system.settings",
    label: "Open Settings",
    description: "Platform settings and configuration",
    category: "settings",
    icon: "⚙️",
    shortcut: "G S",
    execute: () => {
      window.location.href = "/settings";
    },
  },
  {
    id: "system.toggle-theme",
    label: "Toggle Theme",
    description: "Switch between light and dark mode",
    category: "system",
    icon: "🌓",
    execute: () => {
      const event = new CustomEvent("aila:toggleTheme");
      window.dispatchEvent(event);
    },
  },
  {
    id: "workspace.overview",
    label: "Workspace Overview",
    description: "View workspace products and status",
    category: "workspace",
    icon: "📊",
    execute: () => {
      window.location.href = "/workspace";
    },
  },
  {
    id: "dev.registry",
    label: "View Command Registry",
    description: "Inspect all registered commands",
    category: "developer",
    icon: "📋",
    execute: () => {
      window.location.href = "/command-center";
    },
  },
];

export function registerDefaultCommands(): void {
  commands.forEach((cmd) => commandRegistry.register(cmd));
}

export { commands as defaultCommands };
