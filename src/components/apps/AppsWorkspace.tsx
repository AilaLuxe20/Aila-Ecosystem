"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { AppListingDto } from "@/core/apps/service";
import { workspaceFetch } from "@/components/workspace/api";
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

function AppsWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const toast = useToast();
  const [apps, setApps] = useState<AppListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppListingDto | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("web");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/apps", { method: "GET" }, signal)) as {
      data?: { apps?: AppListingDto[] };
    };
    setApps(response.data?.apps ?? []);
    setError(null);
    setLoading(false);
  }, [isSignedIn]);

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

  function openApp(app?: AppListingDto) {
    setEditing(app ?? null);
    setName(app?.name ?? "");
    setSlug(app?.slug ?? "");
    setDescription(app?.description ?? "");
    setPlatform(app?.platform ?? "web");
    setUrl(app?.url ?? "");
    setFormError(null);
    setOpen(true);
  }

  async function save(status?: "draft" | "live" | "archived") {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name,
        slug,
        description,
        platform,
        url: url || null,
        ...(status ? { status } : {}),
      };
      if (editing) {
        await workspaceFetch(`/api/apps/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("App updated");
      } else {
        await workspaceFetch("/api/apps", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("App created");
      }
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the app.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setLive(app: AppListingDto) {
    await workspaceFetch(`/api/apps/${app.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "live" }),
    });
    toast.success("App is live");
    await load();
  }

  return (
    <WorkspaceShell
      product="Apps"
      href="/products/apps"
      accent="indigo"
      title="App registry"
      description="Register the apps you ship. A live listing requires a working URL."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button leadingIcon={<Plus />} onClick={() => openApp()}>New app</Button>}
    >
      {apps.length === 0 ? (
        <EmptyState title="No apps" description="Add an app, then mark it live when the URL works." action={<Button onClick={() => openApp()}>Add app</Button>} />
      ) : (
        <ul className="space-y-3">
          {apps.map((app) => (
            <li key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <button type="button" className="text-left" onClick={() => openApp(app)}>
                <p className="text-sm uppercase tracking-[0.16em] text-white/40">{app.status} · {app.platform}</p>
                <h2 className="mt-1 text-lg font-medium">{app.name}</h2>
                <p className="mt-1 text-sm text-white/50">{app.slug}</p>
              </button>
              <div className="flex gap-2">
                {app.url ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={app.url} target="_blank" rel="noreferrer">Open</a>
                  </Button>
                ) : null}
                {app.status !== "live" ? (
                  <Button size="sm" onClick={() => void setLive(app)}>Mark live</Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit app" : "New app"}</DialogTitle>
            <DialogDescription>Live apps must have a public URL.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} /></Field>
            <Field label="Platform">
              <select className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm" value={platform} onChange={(event) => setPlatform(event.target.value)}>
                <option value="web">Web</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </Field>
            <Field label="URL"><Input value={url} onChange={(event) => setUrl(event.target.value)} /></Field>
            <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            {editing ? (
              <Button variant="secondary" onClick={() => void save("live")} loading={submitting}>Save live</Button>
            ) : null}
            <Button onClick={() => void save()} loading={submitting}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

export function AppsWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <AppsWorkspaceInner />
    </ToastProvider>
  );
}
