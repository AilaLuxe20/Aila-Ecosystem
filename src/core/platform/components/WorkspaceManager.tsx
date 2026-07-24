"use client";

/**
 * Workspace Manager (Core)
 *
 * Core platform component for managing workspaces within the
 * Aila Ecosystem. Displays active workspaces, allows switching
 * between them, and provides workspace management actions.
 *
 * Integrates with the PlatformContext for workspace state
 * and the Command Center for workspace-related commands.
 */

import { useState } from "react";
import { X, Plus, ExternalLink } from "lucide-react";

import { usePlatformContext } from "../providers/PlatformProvider";
import { Workspace } from "../types/platform";

export default function WorkspaceManager() {
  const {
    state,
    closeWorkspace,
    setActiveWorkspace,
    openWorkspace,
  } = usePlatformContext();

  const [showAll, setShowAll] = useState(false);

  const { workspaces, activeWorkspace } = state;

  const visibleWorkspaces = showAll
    ? workspaces
    : workspaces.slice(0, 5);

  const handleSwitch = (workspace: Workspace) => {
    setActiveWorkspace(workspace.id);
  };

  const handleClose = (workspace: Workspace) => {
    closeWorkspace(workspace.id);
  };

  const handleOpenNew = () => {
    openWorkspace("/dashboard");
  };

  if (workspaces.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#080808]/80 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Workspace Manager
        </h2>

        <div className="py-8 text-center text-neutral-500">
          <p>No active workspaces.</p>
          <button
            onClick={handleOpenNew}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Open Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#080808]/80 p-8 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Workspace Manager
        </h2>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10"
        >
          <Plus size={14} />
          New Workspace
        </button>
      </div>

      <div className="space-y-2">
        {visibleWorkspaces.map((workspace) => {
          const isActive =
            activeWorkspace?.id === workspace.id;

          return (
            <div
              key={workspace.id}
              className={`flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/30 p-4 transition ${
                isActive
                  ? "border-luxury-cyan/30 bg-luxury-cyan/[0.03]"
                  : "hover:border-white/20"
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleSwitch(workspace)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-2.5 w-2.5 rounded-full ${
                      isActive
                        ? "bg-luxury-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                        : "bg-neutral-600"
                    }`}
                  />

                  <div>
                    <p
                      className={`font-medium ${
                        isActive
                          ? "text-luxury-cyan"
                          : "text-white"
                      }`}
                    >
                      {workspace.name}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {workspace.route}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {workspace.route && (
                  <button
                    onClick={() => openWorkspace(workspace.route)}
                    className="rounded-lg p-1.5 text-neutral-500 transition hover:text-white"
                    title="Open workspace"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}

                <button
                  onClick={() => handleClose(workspace)}
                  className="rounded-lg p-1.5 text-neutral-500 transition hover:text-red-400"
                  title="Close workspace"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {workspaces.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs text-neutral-400 transition hover:bg-white/10"
        >
          {showAll
            ? "Show fewer"
            : `Show all ${workspaces.length} workspaces`}
        </button>
      )}

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            {workspaces.length} workspace
            {workspaces.length !== 1 ? "s" : ""} active
          </span>

          {activeWorkspace && (
            <span>
              Active:{" "}
              <span className="text-luxury-cyan">
                {activeWorkspace.name}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
