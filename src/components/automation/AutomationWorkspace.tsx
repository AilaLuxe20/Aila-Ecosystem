"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { AutomationRuleDto, AutomationRunDto } from "@/core/automation/service";
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

type ActionType = "email" | "calendar_event" | "business_task";

type FormState = {
  name: string;
  triggerType: "manual" | "interval";
  intervalHours: string;
  actionType: ActionType;
  to: string;
  subject: string;
  body: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormState = {
  name: "",
  triggerType: "manual",
  intervalHours: "24",
  actionType: "business_task",
  to: "",
  subject: "",
  body: "",
  title: "",
  startsAt: "",
  endsAt: "",
};

function payloadFromForm(form: FormState): Record<string, unknown> {
  if (form.actionType === "email") {
    return { to: form.to, subject: form.subject, body: form.body };
  }

  if (form.actionType === "calendar_event") {
    return {
      title: form.title,
      description: form.body || null,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    };
  }

  return { title: form.title, notes: form.body || null };
}

function AutomationWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const api = useWorkspaceApi();
  const toast = useToast();
  const [rules, setRules] = useState<AutomationRuleDto[]>([]);
  const [runs, setRuns] = useState<AutomationRunDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationRuleDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const [rulesBody, runsBody] = (await Promise.all([
      api("/api/automation/rules", { method: "GET" }, signal),
      api("/api/automation/runs", { method: "GET" }, signal),
    ])) as [{ data?: { rules?: AutomationRuleDto[] } }, { data?: { runs?: AutomationRunDto[] } }];
    setRules(rulesBody.data?.rules ?? []);
    setRuns(runsBody.data?.runs ?? []);
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

  function openRule(rule?: AutomationRuleDto) {
    setEditing(rule ?? null);
    setForm(
      rule
        ? {
            name: rule.name,
            triggerType: rule.triggerType as FormState["triggerType"],
            intervalHours: String(rule.intervalHours ?? 24),
            actionType: rule.actionType as ActionType,
            to: String(rule.actionPayload.to ?? ""),
            subject: String(rule.actionPayload.subject ?? ""),
            body: String(rule.actionPayload.body ?? rule.actionPayload.notes ?? rule.actionPayload.description ?? ""),
            title: String(rule.actionPayload.title ?? ""),
            startsAt: rule.actionPayload.startsAt
              ? String(rule.actionPayload.startsAt).slice(0, 16)
              : "",
            endsAt: rule.actionPayload.endsAt ? String(rule.actionPayload.endsAt).slice(0, 16) : "",
          }
        : emptyForm,
    );
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        enabled: true,
        triggerType: form.triggerType,
        intervalHours: form.triggerType === "interval" ? Number(form.intervalHours) : null,
        actionType: form.actionType,
        actionPayload: payloadFromForm(form),
      };
      if (editing) {
        await api(`/api/automation/rules/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Automation updated");
      } else {
        await api("/api/automation/rules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Automation created");
      }
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the automation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function run(rule: AutomationRuleDto) {
    try {
      await api(`/api/automation/rules/${rule.id}/run`, { method: "POST" });
      toast.success("Automation ran");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Automation failed.");
      await load();
    }
  }

  async function remove() {
    if (!editing) return;
    setSubmitting(true);
    try {
      await api(`/api/automation/rules/${editing.id}`, { method: "DELETE" });
      toast.success("Automation deleted");
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to delete the automation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceShell
      product="Automation"
      href="/products/automation"
      accent="violet"
      title="Rules that actually run"
      description="Create a rule, run it now, or schedule it on an interval. Actions send email, create a calendar event, or create a business task."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button leadingIcon={<Plus />} onClick={() => openRule()}>
          New automation
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          {rules.length === 0 ? (
            <EmptyState
              compact
              title="No automations yet"
              description="Create a rule and press Run to execute it."
              action={<Button size="sm" onClick={() => openRule()}>Create rule</Button>}
            />
          ) : (
            <ul className="space-y-2">
              {rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 rounded-xl border border-white/8 px-3 py-3">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openRule(rule)}>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {rule.triggerType} · {rule.actionType}
                      {rule.lastStatus ? ` · last ${rule.lastStatus}` : ""}
                    </p>
                  </button>
                  <Button size="sm" onClick={() => void run(rule)}>
                    Run
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-sm font-medium text-white/70">Recent runs</h2>
          {runs.length === 0 ? (
            <p className="mt-3 text-sm text-white/45">No runs yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {runs.slice(0, 12).map((runItem) => (
                <li key={runItem.id} className="text-xs text-white/55">
                  <span className={runItem.status === "ok" ? "text-emerald-300" : "text-red-300"}>
                    {runItem.status}
                  </span>{" "}
                  {runItem.message}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit automation" : "New automation"}</DialogTitle>
            <DialogDescription>Running a rule performs the action immediately.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name">
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="Trigger">
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                value={form.triggerType}
                onChange={(event) => setForm({ ...form, triggerType: event.target.value as FormState["triggerType"] })}
              >
                <option value="manual">Manual</option>
                <option value="interval">Interval</option>
              </select>
            </Field>
            {form.triggerType === "interval" ? (
              <Field label="Hours between runs">
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={form.intervalHours}
                  onChange={(event) => setForm({ ...form, intervalHours: event.target.value })}
                />
              </Field>
            ) : null}
            <Field label="Action">
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                value={form.actionType}
                onChange={(event) => setForm({ ...form, actionType: event.target.value as ActionType })}
              >
                <option value="business_task">Create business task</option>
                <option value="calendar_event">Create calendar event</option>
                <option value="email">Send email</option>
              </select>
            </Field>
            {form.actionType === "email" ? (
              <>
                <Field label="To">
                  <Input value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} />
                </Field>
                <Field label="Subject">
                  <Input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
                </Field>
                <Field label="Body">
                  <Textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
                </Field>
              </>
            ) : null}
            {form.actionType === "calendar_event" ? (
              <>
                <Field label="Event title">
                  <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                </Field>
                <Field label="Starts">
                  <Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
                </Field>
                <Field label="Ends">
                  <Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
                </Field>
              </>
            ) : null}
            {form.actionType === "business_task" ? (
              <>
                <Field label="Task title">
                  <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                </Field>
                <Field label="Notes">
                  <Textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
                </Field>
              </>
            ) : null}
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            {editing ? (
              <Button variant="destructive" onClick={() => void remove()} loading={submitting}>
                Delete
              </Button>
            ) : null}
            <Button onClick={() => void save()} loading={submitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-10">
        <ChatInterface
          mode="automation"
          showConversationHistory
          placeholder="Ask Aila Automation how to structure a rule..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function AutomationWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <AutomationWorkspaceInner />
    </ToastProvider>
  );
}
