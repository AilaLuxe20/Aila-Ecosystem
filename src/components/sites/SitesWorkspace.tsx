"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { SiteDto } from "@/core/sites/service";
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

function SitesWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const toast = useToast();
  const [sites, setSites] = useState<SiteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SiteDto | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pageTitle, setPageTitle] = useState("Home");
  const [pagePath, setPagePath] = useState("/");
  const [pageContent, setPageContent] = useState("# Welcome\n\nWrite your page here.");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/sites", { method: "GET" }, signal)) as {
      data?: { sites?: SiteDto[] };
    };
    setSites(response.data?.sites ?? []);
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

  function openSite(site?: SiteDto) {
    const home = site?.pages[0];
    setEditing(site ?? null);
    setName(site?.name ?? "");
    setSlug(site?.slug ?? "");
    setDescription(site?.description ?? "");
    setPageTitle(home?.title ?? "Home");
    setPagePath(home?.path ?? "/");
    setPageContent(home?.content ?? "# Welcome\n\nWrite your page here.");
    setFormError(null);
    setOpen(true);
  }

  async function save(status?: "draft" | "published") {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name,
        slug,
        description: description || null,
        pages: [
          {
            id: editing?.pages[0]?.id,
            title: pageTitle,
            path: pagePath,
            content: pageContent,
          },
        ],
        ...(status ? { status } : {}),
      };
      if (editing) {
        await workspaceFetch(`/api/sites/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success(status === "published" ? "Site published" : "Site updated");
      } else {
        await workspaceFetch("/api/sites", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Site created");
      }
      setOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the site.");
    } finally {
      setSubmitting(false);
    }
  }

  async function publish(site: SiteDto) {
    await workspaceFetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    });
    toast.success("Site published");
    await load();
  }

  return (
    <WorkspaceShell
      product="Sites"
      href="/products/sites"
      accent="teal"
      title="Site drafts"
      description="Write pages in markdown, publish them, and open the live URL. Published sites are public at /s/[id]."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button leadingIcon={<Plus />} onClick={() => openSite()}>New site</Button>}
    >
      {sites.length === 0 ? (
        <EmptyState title="No sites" description="Create a site, write the home page, then publish it." action={<Button onClick={() => openSite()}>Create site</Button>} />
      ) : (
        <ul className="space-y-3">
          {sites.map((site) => (
            <li key={site.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <button type="button" className="text-left" onClick={() => openSite(site)}>
                <p className="text-sm uppercase tracking-[0.16em] text-white/40">{site.status}</p>
                <h2 className="mt-1 text-lg font-medium">{site.name}</h2>
                <p className="mt-1 text-sm text-white/50">{site.pages.length} page{site.pages.length === 1 ? "" : "s"}</p>
              </button>
              <div className="flex gap-2">
                {site.status === "published" ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`/s/${site.id}`} target="_blank" rel="noreferrer">View live</a>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void publish(site)}>Publish</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit site" : "New site"}</DialogTitle>
            <DialogDescription>Publishing makes the site readable at a public URL.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} /></Field>
            <Field label="Description"><Input value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
            <Field label="Page title"><Input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} /></Field>
            <Field label="Page path"><Input value={pagePath} onChange={(event) => setPagePath(event.target.value)} /></Field>
            <Field label="Content">
              <Textarea rows={10} value={pageContent} onChange={(event) => setPageContent(event.target.value)} />
            </Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => void save("published")} loading={submitting}>Save and publish</Button>
            <Button onClick={() => void save()} loading={submitting}>Save draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

export function SitesWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <SitesWorkspaceInner />
    </ToastProvider>
  );
}
