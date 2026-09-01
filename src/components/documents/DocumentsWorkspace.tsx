"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { LibraryDocumentDto } from "@/core/documents/service";
import { INTELLIGENCE_ALLOWED_EXTENSIONS } from "@/core/constants";
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

const ACCEPT = INTELLIGENCE_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

function DocumentsWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<LibraryDocumentDto[]>([]);
  const [selected, setSelected] = useState<LibraryDocumentDto | null>(null);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedRef = useRef<LibraryDocumentDto | null>(null);

  function applyDocument(document: LibraryDocumentDto | null) {
    selectedRef.current = document;
    setSelected(document);
    setNotes(document?.notes ?? "");
  }

  const load = useCallback(async (signal?: AbortSignal, search = query) => {
    if (!isSignedIn) return;
    const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
    const response = (await workspaceFetch(`/api/documents${params}`, { method: "GET" }, signal, getToken)) as {
      data?: { documents?: LibraryDocumentDto[] };
    };
    const next = response.data?.documents ?? [];
    const current = selectedRef.current;
    setDocuments(next);
    applyDocument(
      !current ? next[0] ?? null : next.find((item) => item.id === current.id) ?? next[0] ?? null,
    );
    setError(null);
    setLoading(false);
  }, [getToken, isSignedIn, query]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  async function upload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (title.trim()) body.append("title", title.trim());
      const response = (await workspaceFetch("/api/documents", { method: "POST", body }, undefined, getToken)) as {
        data?: { document?: LibraryDocumentDto };
      };
      toast.success("Document uploaded");
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
      if (response.data?.document) applyDocument(response.data.document);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to upload the document.");
    } finally {
      setUploading(false);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/documents/${selected.id}`,
        { method: "PATCH", body: JSON.stringify({ notes: notes || null }) },
        undefined,
        getToken,
      );
      toast.success("Notes saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save notes.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/documents/${selected.id}`, { method: "DELETE" }, undefined, getToken);
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
      product="Documents"
      href="/products/documents"
      accent="orange"
      title="Document library"
      description="Upload a PDF, TXT, Markdown, CSV, or JSON file. Aila extracts readable text and stores it on your account."
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="mb-6 space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="File">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional — defaults to the file name" />
          </Field>
          <div className="flex items-end">
            <Button onClick={() => void upload()} loading={uploading}>Upload</Button>
          </div>
        </div>
        <Field label="Search">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, file name, extracted text, or notes"
          />
        </Field>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title={query.trim() ? "No matches" : "No documents"}
          description={
            query.trim()
              ? "Try a different search."
              : "Upload a PDF, text, Markdown, CSV, or JSON file to extract its text."
          }
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
                      ? "border-orange-300/30 bg-orange-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{document.fileName}</p>
                  <p className="mt-1 truncate text-sm font-medium">{document.title}</p>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">{selected.fileName}</p>
                <h2 className="mt-1 text-lg font-medium">{selected.title}</h2>
              </div>
              {selected.truncated ? (
                <p className="text-sm text-amber-200/80">Extracted text was truncated at the size limit.</p>
              ) : null}
              <Field label="Extracted text">
                <Textarea value={selected.extractedText} readOnly rows={12} />
              </Field>
              <Field label="Notes">
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void saveNotes()} loading={saving}>Save notes</Button>
                <Button variant="secondary" onClick={() => void remove()} loading={saving}>Delete</Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="documents"
          showConversationHistory
          placeholder="Ask Aila Documents about a file you uploaded..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function DocumentsWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <DocumentsWorkspaceInner />
    </ToastProvider>
  );
}
