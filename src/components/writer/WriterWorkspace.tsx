"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { WriterDocumentDto } from "@/core/writer/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

function WriterWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<WriterDocumentDto[]>([]);
  const [selected, setSelected] = useState<WriterDocumentDto | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [folder, setFolder] = useState("");
  const [status, setStatus] = useState("draft");
  const [instruction, setInstruction] = useState("Rewrite more clearly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const selectedRef = useRef<WriterDocumentDto | null>(null);

  function applyDocument(document: WriterDocumentDto | null) {
    selectedRef.current = document;
    setSelected(document);
    setTitle(document?.title ?? "");
    setBody(document?.body ?? "");
    setFolder(document?.folder ?? "");
    setStatus(document?.status ?? "draft");
  }

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/writer", { method: "GET" }, signal, getToken)) as {
      data?: { documents?: WriterDocumentDto[] };
    };
    const next = response.data?.documents ?? [];
    const current = selectedRef.current;
    setDocuments(next);
    applyDocument(
      !current ? next[0] ?? null : next.find((item) => item.id === current.id) ?? next[0] ?? null,
    );
    setError(null);
    setLoading(false);
  }, [getToken, isSignedIn]);

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

  async function createDocument() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/writer",
        { method: "POST", body: JSON.stringify({ title: "Untitled", body: "" }) },
        undefined,
        getToken,
      )) as { data?: { document?: WriterDocumentDto } };
      toast.success("Document created");
      await load();
      if (response.data?.document) applyDocument(response.data.document);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the document.");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/writer/${selected.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title, body, folder: folder || null, status }),
        },
        undefined,
        getToken,
      );
      toast.success("Saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  async function rewrite() {
    if (!body.trim()) return;
    setRewriting(true);
    try {
      const response = (await workspaceFetch(
        "/api/writer/rewrite",
        { method: "POST", body: JSON.stringify({ instruction, body }) },
        undefined,
        getToken,
      )) as { data?: { text?: string } };
      if (!response.data?.text) throw new Error("Aila did not return rewritten text.");
      setBody(response.data.text);
      toast.success("Rewrite ready — save to keep it.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to rewrite.");
    } finally {
      setRewriting(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/writer/${selected.id}`, { method: "DELETE" }, undefined, getToken);
      applyDocument(null);
      toast.success("Deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell
      product="Writer"
      href="/products/writer"
      accent="lime"
      title="Writing workspace"
      description="Draft, edit, and rewrite documents on your account. Rewrites use OpenRouter and stay unpublished until you save."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button leadingIcon={<Plus />} onClick={() => void createDocument()} loading={saving}>New document</Button>}
    >
      {documents.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Create a document, write in the editor, then save. Use rewrite when you want Aila to edit the draft."
          action={<Button onClick={() => void createDocument()}>Create document</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {documents.map((document) => (
              <li key={document.id}>
                <button
                  type="button"
                  onClick={() => applyDocument(document)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selected?.id === document.id
                      ? "border-lime-300/30 bg-lime-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{document.status}</p>
                  <p className="mt-1 truncate text-sm font-medium">{document.title}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
              <Field label="Folder"><Input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="Optional" /></Field>
            </div>
            <Field label="Status">
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="final">Final</option>
              </select>
            </Field>
            <Field label="Document">
              <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Rewrite instruction">
                <Input value={instruction} onChange={(event) => setInstruction(event.target.value)} />
              </Field>
              <div className="flex items-end">
                <Button variant="secondary" onClick={() => void rewrite()} loading={rewriting}>Rewrite with Aila</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void save()} loading={saving}>Save</Button>
              <Button variant="secondary" onClick={() => void remove()} loading={saving}>Delete</Button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="writer"
          showConversationHistory
          placeholder="Ask Aila Writer to help with this draft..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function WriterWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <WriterWorkspaceInner />
    </ToastProvider>
  );
}
