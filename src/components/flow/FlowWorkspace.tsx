"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { FlowDto } from "@/core/flow/service";
import { useWorkspaceApi } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

function FlowWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const api = useWorkspaceApi();
  const toast = useToast();
  const [flows, setFlows] = useState<FlowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FlowDto | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stepsText, setStepsText] = useState("Research\nBuild\nReview");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await api("/api/flow", { method: "GET" }, signal)) as {
      data?: { flows?: FlowDto[] };
    };
    setFlows(response.data?.flows ?? []);
    setError(null);
    setLoading(false);
  }, [api, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  function openFlow(flow?: FlowDto) {
    setEditing(flow ?? null);
    setName(flow?.name ?? "");
    setDescription(flow?.description ?? "");
    setStepsText(flow ? flow.steps.map((step) => step.title).join("\n") : "Research\nBuild\nReview");
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    setFormError(null);
    try {
      const titles = stepsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const payload = {
        name,
        description: description || null,
        steps: titles.map((title, index) => ({
          id: editing?.steps[index]?.id,
          title,
          body: editing?.steps[index]?.body ?? null,
          status: editing?.steps[index]?.status ?? "pending",
        })),
      };
      if (editing) {
        await api(`/api/flow/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Flow updated");
      } else {
        await api("/api/flow", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Flow created");
      }
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the flow.");
    } finally {
      setSubmitting(false);
    }
  }

  async function advance(flow: FlowDto) {
    await api(`/api/flow/${flow.id}/advance`, { method: "POST" });
    toast.success("Next step completed");
    await load();
  }

  async function reset(flow: FlowDto) {
    await api(`/api/flow/${flow.id}/reset`, { method: "POST" });
    toast.success("Flow reset");
    await load();
  }

  return (
    <WorkspaceShell
      product="Flow"
      href="/products/flow"
      accent="fuchsia"
      title="Workflows"
      description="Define ordered steps, then advance the current step when the work is done."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button leadingIcon={<Plus />} onClick={() => openFlow()}>New flow</Button>}
    >
      {flows.length === 0 ? (
        <EmptyState title="No flows" description="Create a flow, then complete steps in order." action={<Button onClick={() => openFlow()}>Create flow</Button>} />
      ) : (
        <ul className="space-y-4">
          {flows.map((flow) => {
            const done = flow.steps.filter((step) => step.status === "done").length;
            return (
              <li key={flow.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" className="text-left" onClick={() => openFlow(flow)}>
                    <h2 className="text-lg font-medium">{flow.name}</h2>
                    <p className="mt-1 text-sm text-white/50">
                      {done}/{flow.steps.length} steps complete
                    </p>
                  </button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void reset(flow)}>Reset</Button>
                    <Button size="sm" onClick={() => void advance(flow)}>Complete next step</Button>
                  </div>
                </div>
                <ol className="mt-4 space-y-2">
                  {flow.steps.map((step, index) => (
                    <li key={step.id} className="text-sm text-white/70">
                      <span className={step.status === "done" ? "text-emerald-300" : "text-white/40"}>
                        {index + 1}.
                      </span>{" "}
                      <span className={step.status === "done" ? "line-through text-white/40" : ""}>
                        {step.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit flow" : "New flow"}</DialogTitle>
            <DialogDescription>One step per line. Completing a step moves the flow forward.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Description"><Input value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
            <Field label="Steps">
              <Textarea rows={8} value={stepsText} onChange={(event) => setStepsText(event.target.value)} />
            </Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void save()} loading={submitting}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-10">
        <ChatInterface
          mode="flow"
          showConversationHistory
          placeholder="Ask Aila Flow how to structure these steps..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function FlowWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <FlowWorkspaceInner />
    </ToastProvider>
  );
}
